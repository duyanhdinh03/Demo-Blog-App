pipeline {
    agent {
        label 'docker-swarm-agent' 
    }

    environment {
        NEXUS_URL = credentials('nexus-url') 
        NEXUS_REPO = "repository/docker-hosted"
        CLOUDFLARE_PROJECT = "my-blog-app"
        DOCKER_REGISTRY = "${NEXUS_URL}/${NEXUS_REPO}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git(
                    url: 'https://github.com/duyanhdinh03/Demo-Blog-App.git',
                    branch: 'master',
                    changelog: false,
                    poll: false
                )
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci --no-audit'
                    sh 'npm run build --configuration production'
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                withCredentials([string(
                    credentialsId: 'cloudflare-api-token',
                    variable: 'CLOUDFLARE_API_TOKEN'
                )]) {
                    sh '''
                        curl -X POST "https://api.cloudflare.com/client/v4/pages/webhooks/trigger/$CLOUDFLARE_PROJECT" \
                        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
                        -H "Content-Type: application/json"
                    '''
                }
            }
        }

        stage('Code Quality Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    dir('backend') {
                        sh 'mvn sonar:sonar -Dsonar.projectKey=my-blog-backend'
                    }
                }
            }
        }

        stage('Build & Scan Images') {
            steps {
                script {
                    def images = [
                        'backend': 'Dockerfile.backend',
                        'nginx': 'Dockerfile.nginx'
                    ]

                    images.each { name, dockerfile ->
                        dir(name) {
                            // Build image
                            sh "docker build -t ${name}:latest -f ${dockerfile} ."
                            
                            // Scan with Trivy
                            def scanResult = sh(
                                script: "docker run --rm aquasec/trivy image --exit-code 0 --severity HIGH,CRITICAL ${name}:latest",
                                returnStatus: true
                            )
                            
                            if (scanResult != 0) {
                                unstable "Trivy found vulnerabilities in ${name} image"
                            }
                        }
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'nexus-credentials',
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )
                ]) {
                    script {
                        sh "docker login -u $NEXUS_USER -p $NEXUS_PASS $NEXUS_URL"
                        
                        ['backend', 'nginx'].each { name ->
                            sh """
                                docker tag ${name}:latest ${DOCKER_REGISTRY}/${name}:latest
                                docker push ${DOCKER_REGISTRY}/${name}:latest
                            """
                        }
                    }
                }
            }
        }

        stage('Deploy Stack') {
            steps {
                withAWS(
                    credentials: 'aws-credentials',
                    region: 'us-east-1'
                ) {
                    script {
                        // Get database credentials
                        def rdsSecret = getSecret('rds-credentials')
                        def dbSecret = getSecret('db-password')
                        def sonarSecret = getSecret('db-sonar-password')

                        // Generate dynamic stack file
                        writeFile(
                            file: 'docker-stack.prod.yml',
                            text: generateStackConfig(
                                rdsHost: rdsSecret.host,
                                rdsPort: rdsSecret.port,
                                dbName: rdsSecret.dbname,
                                dbPassword: dbSecret,
                                sonarPassword: sonarSecret
                            )
                        )

                        // Deploy stack
                        sh '''
                            docker stack deploy \
                                --with-registry-auth \
                                -c docker-stack.prod.yml \
                                blog-demo
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
            script {
                // Cleanup temporary credentials
                sh 'docker logout $NEXUS_URL || true'
            }
        }
        success {
            slackSend(
                color: 'good',
                message: "Deployment SUCCESSFUL: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
        failure {
            slackSend(
                color: 'danger',
                message: "Deployment FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
    }
}

// Helper functions
def getSecret(String secretName) {
    def secretText = sh(
        script: """
            aws secretsmanager get-secret-value \
                --secret-id ${secretName} \
                --query SecretString \
                --output text
        """,
        returnStdout: true
    ).trim()
    
    return readJSON(text: secretText)
}

def generateStackConfig(Map args) {
    return """
        version: '3.8'

        services:
            sonarqube:
                environment:
                    SONAR_JDBC_URL: jdbc:postgresql://${args.rdsHost}:${args.rdsPort}/sonarqube
                    SONAR_JDBC_PASSWORD: ${args.sonarPassword}

            backend:
                environment:
                    SPRING_DATASOURCE_URL: jdbc:postgresql://${args.rdsHost}:${args.rdsPort}/${args.dbName}
                    SPRING_DATASOURCE_PASSWORD: ${args.dbPassword}

        # ... (rest of your stack configuration)
    """
}
