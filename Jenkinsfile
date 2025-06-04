pipeline { 
    agent any stages { 
        stage('Checkout') { 
            steps { 
                checkout scm 
            } 
        } 
        stage('Build Frontend') { 
            steps { 
                dir('blog-frontend') { 
                    sh 'npm install' sh 'npm run build' 
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
                    sh 'mvn clean package' 
                } 
            } 
        } 
        stage('Scan') { 
            steps { 
                dir('blog-backend') { 
                    sh 'trivy fs . --exit-code 1 --severity HIGH,CRITICAL' 
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
                sh 'docker stack deploy -c docker-stack.yml blogdemo' 
            } 
        } 
    } 
}
