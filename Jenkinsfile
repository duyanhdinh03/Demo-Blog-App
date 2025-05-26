pipeline {
    agent any

    environment {
        NEXUS_URL = getSecret('nexus-url').url
        NEXUS_REPO = "repository/docker-hosted"
        CLOUDFLARE_PROJECT = "my-blog-app"
        DOCKER_REGISTRY = "${NEXUS_URL}/${NEXUS_REPO}"
        SONARQUBE_TOKEN = credentials('sonarqube-token')
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
                        sh "mvn sonar:sonar -Dsonar.projectKey=my-blog-backend -Dsonar.login=${SONARQUBE_TOKEN}"
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
                            sh "docker build -t ${name}:latest -f ${dockerfile} ."
                            
                            // Fail pipeline nếu có lỗi CRITICAL
                            def scanResult = sh(
                                script: "trivy image --exit-code 1 --severity CRITICAL ${name}:latest",
                                returnStatus: true
                            )
                            
                            if (scanResult != 0) {
                                error "Trivy found CRITICAL vulnerabilities in ${name} image"
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
                    region: 'ap-southeast-1'
                ) {
                    script {
                        def rdsSecret = getSecret('rds-credentials')
                        def dbSecret = getSecret('db-password')
                        def sonarSecret = getSecret('db-sonar-password')

                        writeFile(
                            file: 'docker-stack.prod.yml',
                            text: generateStackConfig(
                                rdsHost: rdsSecret.host,
                                rdsPort: rdsSecret.port,
                                dbName: rdsSecret.dbname,
                                dbPassword: dbSecret,
                                sonarPassword: sonarSecret,
                                nexusUrl: env.NEXUS_URL
                            )
                        )

                        sh '''
                            docker stack deploy \
                                --with-registry-auth \
                                -c docker-stack.prod.yml \
                                blog-demo-cicd
                        '''
                    }
                }
            }
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
            prometheus:
                image: prom/prometheus
                volumes:
                    - prometheus_data:/prometheus
                ports:
                    - "9090:9090"
                networks:
                    - blogdemo-network
                deploy:
                    placement:
                        constraints: [node.role == manager]

            grafana:
                image: grafana/grafana
                ports:
                    - "3000:3000"
                networks:
                    - blogdemo-network
                deploy:
                    placement:
                        constraints: [node.role == manager]

            sonarqube:
                image: sonarqube:community
                environment:
                    SONAR_JDBC_URL: jdbc:postgresql://${args.rdsHost}:${args.rdsPort}/sonarqube
                    SONAR_JDBC_PASSWORD: ${args.sonarPassword}
                networks:
                    - blogdemo-network
                deploy:
                    placement:
                        constraints: [node.role == manager]

            backend:
                image: ${args.nexusUrl}/repository/docker-hosted/my-blog-backend:latest
                environment:
                    SPRING_DATASOURCE_URL: jdbc:postgresql://${args.rdsHost}:${args.rdsPort}/${args.dbName}
                    SPRING_DATASOURCE_PASSWORD: ${args.dbPassword}
                networks:
                    - blogdemo-network
                deploy:
                    replicas: 3

            nginx:
                image: ${args.nexusUrl}/repository/docker-hosted/my-nginx:latest
                ports:
                    - "80:80"
                networks:
                    - blogdemo-network
                deploy:
                    replicas: 3

        networks:
            blogdemo-network:
                external: true

        volumes:
            prometheus_data:
    """
}
