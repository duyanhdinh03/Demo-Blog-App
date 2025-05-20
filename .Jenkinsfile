pipeline {
    agent any
    environment {
        NEXUS_URL = "10.0.2.10:8081"
        NEXUS_REPO = "repository/docker-hosted"
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/duyanhdinh03/Demo-Blog-App.git', branch: 'master'
            }
        }
        stage('Code Quality Check - SonarQube') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    dir('backend') {
                        sh 'mvn sonar:sonar -f pom.xml'
                    }
                }
            }
        }
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean package'
                    sh 'docker build -t my-blog-backend:latest -f Dockerfile.backend .'
                }
            }
        }
        stage('Build NGINX Proxy') {
            steps {
                dir('nginx') {
                    sh 'docker build -t my-nginx:latest -f Dockerfile.nginx .'
                }
            }
        }
        stage('Scan Image - Trivy') {
            steps {
                sh 'docker run --rm aquasec/trivy image my-blog-backend:latest'
                sh 'docker run --rm aquasec/trivy image my-nginx:latest'
            }
        }
        stage('Push to Nexus') {
            steps {
                withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                    sh '''
                    aws secretsmanager get-secret-value --secret-id nexus_credentials --query SecretString --output text > /tmp/nexus_cred
                    NEXUS_USER=$(cat /tmp/nexus_cred | jq -r .username)
                    NEXUS_PASS=$(cat /tmp/nexus_cred | jq -r .password)
                    docker login -u $NEXUS_USER -p $NEXUS_PASS $NEXUS_URL
                    docker tag my-blog-backend:latest $NEXUS_URL/$NEXUS_REPO/my-blog-backend:latest
                    docker tag my-nginx:latest $NEXUS_URL/$NEXUS_REPO/my-nginx:latest
                    docker push $NEXUS_URL/$NEXUS_REPO/my-blog-backend:latest
                    docker push $NEXUS_URL/$NEXUS_REPO/my-nginx:latest
                    rm -f /tmp/nexus_cred
                    '''
                }
            }
        }
        stage('Deploy to Swarm') {
            steps {
                withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                    sh '''
                    aws secretsmanager get-secret-value --secret-id rds_credentials --query SecretString --output text > /tmp/rds_cred
                    DB_HOST=$(cat /tmp/rds_cred | jq -r .host)
                    DB_PORT=$(cat /tmp/rds_cred | jq -r .port)
                    DB_NAME=$(cat /tmp/rds_cred | jq -r .dbname)
                    aws secretsmanager get-secret-value --secret-id db_password --query SecretString --output text > /tmp/db_password
                    aws secretsmanager get-secret-value --secret-id db_sonar_password --query SecretString --output text > /tmp/db_sonar_password
                    docker secret rm db_password db_sonar_password || true
                    docker secret create db_password /tmp/db_password
                    docker secret create db_sonar_password /tmp/db_sonar_password
                    sed -i "s|jdbc:postgresql://.*:5432/sonarqube|jdbc:postgresql://$DB_HOST:$DB_PORT/sonarqube|" docker-stack.yml
                    sed -i "s|jdbc:postgresql://.*:5432/blogdb|jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME|" docker-stack.yml
                    docker stack rm blog-demo || true
                    docker stack deploy -c docker-stack.yml blog-demo
                    rm -f /tmp/rds_cred /tmp/db_password /tmp/db_sonar_password
                    '''
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}
