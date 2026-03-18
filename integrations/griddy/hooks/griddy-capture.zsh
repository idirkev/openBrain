# griddy: auto-tile on "capture" in terminal
_griddy_capture_preexec() {
    if [[ "$1" == *capture* ]]; then
        "$HOME/.local/bin/griddy" &>/dev/null &
    fi
}
autoload -Uz add-zsh-hook
add-zsh-hook preexec _griddy_capture_preexec
