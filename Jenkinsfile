pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Mayankkemani/TaskAPI.git'
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh 'docker compose down || true'
            }
        }

        stage('Build and Start') {
            steps {
                sh 'docker compose up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Waiting for the app to become healthy..."
                    for i in $(seq 1 15); do
                        if curl -sf http://localhost:3000/health; then
                            echo "App is healthy!"
                            exit 0
                        fi
                        sleep 2
                    done
                    echo "App did not become healthy in time."
                    docker compose logs
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployed successfully! Visit http://43.204.218.83:3000/tasks'
        }
        failure {
            echo 'Build or deployment failed - check the logs above.'
        }
    }
}
