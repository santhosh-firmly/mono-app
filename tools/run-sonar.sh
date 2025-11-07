set -e;

if [ -z "$1" ]; then
    echo Usage: "$(basename $0) <project-folder>";
    exit 1;
fi;

if [ -z $SONAR_HOST_URL ] || [ -z $SONAR_TOKEN ]; then
    echo "You must configure SONAR_HOST_URL and SONAR_TOKEN URLs";
    exit 1;
fi;

pushd "$1";

npx sonarqube-scanner \
    -Dsonar.branch.name=${GITHUB_REF_NAME:-$(git branch --show-current)} \
    -Dsonar.host.url="$SONAR_HOST_URL" \
    -Dsonar.token="$SONAR_TOKEN" \
    -Dsonar.projectKey=$(basename $(pwd)) \
    -Dsonar.exclusions='vendor/**' \
    -Dsonar.test.exclusions='tests/unit-tests/data/**, tests/**/data/**' \
    -Dsonar.projectBaseDir=. \
    -Dsonar.javascript.lcov.reportPaths=./coverage/lcov.info \
    -Dsonar.sourceEncoding=UTF-8

popd;
