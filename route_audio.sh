#!/bin/bash

set -e

command -v pactl >/dev/null 2>&1 || {
    echo "ERROR: pactl not found, please install pulseaudio-utils package with sudo apt install pulseaudio-utils"
    exit 1
}

pactl info >/dev/null || {
    echo "ERROR: PipeWire/PulseAudio server unavailable"
    exit 1
}

echo "Resetting old audio routing if exist..."

DEFAULT_SINK=$(pactl list short sinks | awk '{print $2}')

MODULE_IDS=$(pactl list short modules | awk -v ds="$DEFAULT_SINK" '
    ($2 == "module-loopback" || $2 == "module-remap-source" || $2 == "module-null-sink") && \
    ($0 ~ "virtual_sink" || $0 ~ "virtual_mic" || $0 ~ ds) {
        print $1
    }
')


if [ -n "$MODULE_IDS" ]; then
    for id in $MODULE_IDS; do
        pactl unload-module "$id" 2>/dev/null || true
    done
fi


DEFAULT_SINK=$(pactl list short sinks | awk '{print $2}')
DEFAULT_SINK_MONITOR="${DEFAULT_SINK}.monitor"
VIRTUAL_SINK="virtual_sink"
VIRTUAL_MIC="virtual_mic"

echo "Creating $VIRTUAL_SINK..."

if ! pactl list short sinks | awk '{print $2}' | grep -Fxq "$VIRTUAL_SINK"; then
    pactl load-module module-null-sink \
        sink_name="$VIRTUAL_SINK" \
        sink_properties=device.description=VirtualSink >/dev/null
fi

echo "Creating $VIRTUAL_MIC from $DEFAULT_SINK_MONITOR..."

if ! pactl list short sources | awk '{print $2}' | grep -Fxq "$VIRTUAL_MIC"; then
    pactl load-module module-remap-source \
        "master=$DEFAULT_SINK_MONITOR" \
        source_name="$VIRTUAL_MIC" \
        source_properties=device.description=VirtualMic >/dev/null
fi

echo "Creating looopback $DEFAULT_SINK_MONITOR to $VIRTUAL_SINK"

LOOPBACK_ID=$(
    pactl list short modules |
    awk -v source="$VIRTUAL_MIC" -v sink="$VIRTUAL_SINK" '
        $2 == "module-loopback" &&
        index($0, "source=" source) &&
        index($0, "sink=" sink) {
            print $1
            exit
        }
    '
)

if [[ -z "$LOOPBACK_ID" ]]; then
    pactl load-module module-loopback \
        "source=$DEFAULT_SINK_MONITOR" \
        "sink=$VIRTUAL_SINK" >/dev/null
fi

echo "Set $VIRTUAL_MIC as default source..."
pactl set-default-source virtual_mic

echo
echo "Audio routing finished"
echo "Default playback : $DEFAULT_SINK"
echo "VirtualSink      : $VIRTUAL_SINK"
echo "VirtualMic       : $VIRTUAL_MIC"
echo "Default input    : $VIRTUAL_MIC"
echo "Loopback         : $DEFAULT_SINK_MONITOR -> $VIRTUAL_SINK"
