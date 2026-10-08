#!/usr/bin/env bash
# Loops + the re-renders queued after review. Frames go to $PULSE_FRAMES.
cd "$(dirname "$0")/../.."
export PULSE_FRAMES="${PULSE_FRAMES:-D:/PULSE_frames}"
B="D:/blender.exe"; M=production/pulse-approved/PULSE_APPROVED_MASTER.blend; LOG=production/renders/render.log
run() { "$B" -b "$M" --python production/pipeline/render.py -- "$@" 2>&1 | grep -E "PULSE_|Traceback|Error:|No space" >> "$LOG"; }
echo "loops start $(date)" >> "$LOG"
run final
run hero phys1 --anim
echo "loops done $(date)" >> "$LOG"
sha256sum -c production/pipeline/MASTER.sha256 >> "$LOG"
