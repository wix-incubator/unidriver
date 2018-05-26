if [[ ${IS_BUILD_AGENT} == true ]]; then reporter=mocha-teamcity-reporter; else reporter=spec; fi

mocha --timeout 20000 \
--reporter $reporter \
--exit \
'dist/**/*/spec.js' 'dist/spec.js'
