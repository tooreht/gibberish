watchmedo shell-command \
    --patterns="*.scss" \
    --recursive \
    --command='sassc gibberish/assets/sass/screen.scss gibberish/static/css/screen.css' \
    .
