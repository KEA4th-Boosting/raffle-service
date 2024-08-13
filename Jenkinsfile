pipeline {
    agent any

    tools {
        nodejs 'nodejs-20' 
    }

    environment {
        GITHUB_URL = 'https://github.com/KEA4th-Boosting/raffle-service.git'
        APP_VERSION = '1.1.1'
        BUILD_DATE = sh(script: "echo `date +%y%m%d.%d%H%M`", returnStdout: true).trim()
//         TAG = "${APP_VERSION}"
        TAG = "${APP_VERSION}-${BUILD_DATE}"
        IMAGE_NAME = 'raffle-service'
        SERVICE_NAME = 'raffle-service'
        KAKAO_PROJECT_NAME = 'rafvacation'
        KAKAO_REPOSITORY_NAME = 'boosting'
        KAKAO_REGISTRY = "rafvacation.kr-central-2.kcr.dev"
    }

    stages {
        stage('소스파일 체크아웃') {
            steps {
                script {
                    env.BRANCH_NAME = env.BRANCH_NAME ?: 'develop'
                    checkout([$class: 'GitSCM', branches: [[name: "*/${env.BRANCH_NAME}"]], userRemoteConfigs: [[url: GITHUB_URL, credentialsId: 'github-signin']]])
                }
            }
        }

        stage('의존성 설치') {
            steps {
                sh "npm install"
            }
        }

        stage('소스 빌드') {
            steps {
                sh "npm run build"
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([string(credentialsId: 'kakao-access-key', variable: 'ACCESS_KEY'), string(credentialsId: 'kakao-secret-key', variable: 'ACCESS_SECRET_KEY')]) {
                    sh '''
                        echo $ACCESS_SECRET_KEY | docker login ${KAKAO_PROJECT_NAME}.kr-central-2.kcr.dev --username $ACCESS_KEY --password-stdin
                    '''
                }
            }
        }

        stage('Build Container') {
            steps {
                script {
                    sh "docker build -t ${KAKAO_PROJECT_NAME}.kr-central-2.kcr.dev/${KAKAO_REPOSITORY_NAME}/${IMAGE_NAME}:${TAG} -f Dockerfile ."
                    sh "docker tag ${KAKAO_PROJECT_NAME}.kr-central-2.kcr.dev/${KAKAO_REPOSITORY_NAME}/${IMAGE_NAME}:${TAG} ${KAKAO_PROJECT_NAME}.kr-central-2.kcr.dev/${KAKAO_REPOSITORY_NAME}/${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh "docker push ${KAKAO_PROJECT_NAME}.kr-central-2.kcr.dev/${KAKAO_REPOSITORY_NAME}/${IMAGE_NAME}:${TAG}"
                sh "docker push ${KAKAO_PROJECT_NAME}.kr-central-2.kcr.dev/${KAKAO_REPOSITORY_NAME}/${IMAGE_NAME}:latest"
            }
        }

        stage('Delete Docker Image') {
            steps {
                sh "docker rmi ${KAKAO_PROJECT_NAME}.kr-central-2.kcr.dev/${KAKAO_REPOSITORY_NAME}/${IMAGE_NAME}:${TAG}"
                sh "docker rmi ${KAKAO_PROJECT_NAME}.kr-central-2.kcr.dev/${KAKAO_REPOSITORY_NAME}/${IMAGE_NAME}:latest"
            }
        }
    }

    post {
        always {
            sh "docker logout"
            sh "unset ACCESS_KEY"
            sh "unset ACCESS_SECRET_KEY"
        }
    }
}