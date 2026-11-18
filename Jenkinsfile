
pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install --omit=dev'
            }
        }

        stage('Deploy Application') {
            steps {
                sh 'sudo /usr/local/bin/deploy-node-app "$WORKSPACE"'
            }
        }

        stage('Verify Application') {
            steps {
                sh 'curl -f http://127.0.0.1:3000'
            }
        }
    }

    post {
        success {
            echo 'Application deployed successfully!'
        }

        failure {
            echo 'Deployment failed. Check console output.'
        }
    }
}
