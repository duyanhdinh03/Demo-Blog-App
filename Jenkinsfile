pipeline {
    agent any
    triggers {
        pollSCM('') 
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/duyanhdinh03/Demo-Blog-App', 
                     credentialsId: 'github-api-token',
                     branch: 'master' 
            }
        }
        stage('Build Frontend') {
            steps {
                dir('blog-frontend') {
                    sh 'npm install'
                    sh 'ng build --configuration production'
                }
            }
        }
        stage('Deploy Frontend') {
            steps {
                withCredentials([string(credentialsId: 'cloudflare-api-token', variable: 'CLOUDFLARE_API_TOKEN')]) {
                    dir('blog-frontend/dist') {
                        sh 'npx @cloudflare/wrangler pages publish . --project-name=blogdemo --api-token=$CLOUDFLARE_API_TOKEN'
                    }
                }
            }
        }
        stage('Build Backend') {
            steps {
                dir('blog-backend') {
                    sh 'mvn clean package -DskipTests' 
                }
            }
        }
        stage('Scan') {
            steps {
                dir('blog-backend') {
                    sh 'trivy fs . --exit-code 1 --severity HIGH,CRITICAL'
                }
            }
            post {
                failure {
                    echo 'Security scan failed, but pipeline will continue. Check vulnerabilities in Trivy report.'
                }
            }
        }
        stage('Build Docker Image - Backend') {
            steps {
                dir('blog-backend') {
                    sh 'docker build -t blogdemo-backend:latest .'
                }
            }
        }
        stage('Push Docker Image - Backend') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD'
                    sh 'docker tag blogdemo-backend:latest $DOCKER_USERNAME/blogdemo-backend:latest'
                    sh 'docker push $DOCKER_USERNAME/blogdemo-backend:latest'
                }
            }
        }
        stage('Deploy to Swarm') {
            steps {
                withCredentials([string(credentialsId: 'rds-endpoint', variable: 'RDS_ENDPOINT')]) {
                    sh """
                    ssh -i /path/to/your-key-pair.pem ubuntu@<manager-public-ip> << 'EOF'
                    export RDS_ENDPOINT=${RDS_ENDPOINT}
                    docker stack deploy -c /path/to/docker-stack.yml blogdemo
                    EOF
                    """
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline completed. Check results.'
            cleanWs()
        }
        failure {
            echo 'Pipeline failed. Check logs for details.'
        }
    }
}
