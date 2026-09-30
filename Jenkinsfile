pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend Install & Build') {
            steps {
                dir('demo_fe_v1') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Backend Install') {
            steps {
                dir('demo_be_v1') {
                    sh 'npm ci'
                }
            }
        }

        stage('Test') {
            steps {
                echo 'CI test stage completed'
            }
        }
    }

    post {
        success {
            echo 'CI Pipeline completed successfully'
        }
        failure {
            echo 'CI Pipeline failed'
        }
    }
}
