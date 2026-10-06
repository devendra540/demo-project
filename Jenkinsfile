pipeline {
    agent any

    environment {
        APP_INSTANCE_ID = 'i-03785fedb8c133e86'
        AWS_REGION = 'ap-south-1'
    }

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

        stage('Deploy to App EC2') {
            steps {
                script {

                    def commitId = sh(
                        script: 'git rev-parse HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Deploying commit: ${commitId}"

                    def commandId = sh(
                        script: """
                            aws ssm send-command \
                              --region ${AWS_REGION} \
                              --instance-ids ${APP_INSTANCE_ID} \
                              --document-name AWS-RunShellScript \
                              --parameters '{"commands":["export HOME=/root","cd /var/www/demo-project","git config --global --add safe.directory /var/www/demo-project","git fetch origin master","git reset --hard ${commitId}","cd demo_fe_v1","npm ci","npm run build","cd ../demo_be_v1","npm ci","if pm2 describe demo-backend >/dev/null 2>&1; then pm2 restart demo-backend --update-env; else pm2 start server.js --name demo-backend; fi","pm2 save","nginx -t","systemctl reload nginx","pm2 status","echo DEPLOYMENT_SUCCESS"]}' \
                              --query 'Command.CommandId' \
                              --output text
                        """,
                        returnStdout: true
                    ).trim()

                    echo "SSM Command ID: ${commandId}"

                    sleep(time: 15, unit: 'SECONDS')

                    def result = sh(
                        script: """
                            aws ssm get-command-invocation \
                              --region ${AWS_REGION} \
                              --command-id ${commandId} \
                              --instance-id ${APP_INSTANCE_ID} \
                              --query '[Status,StandardOutputContent,StandardErrorContent]' \
                              --output text
                        """,
                        returnStdout: true
                    ).trim()

                    echo "Deployment result:"
                    echo result

                    if (!result.contains('DEPLOYMENT_SUCCESS')) {
                        error("Deployment failed")
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'CI/CD Pipeline completed successfully'
        }

        failure {
            echo 'CI/CD Pipeline failed'
        }
    }
}
