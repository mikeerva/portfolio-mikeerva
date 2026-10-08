#!/usr/bin/env bash
# Full production render: stills first, then the loops. Logs to production/renders/render.log
cd "$(dirname "$0")/../.."
B="D:/blender.exe"; M=production/pulse-approved/PULSE_APPROVED_MASTER.blend; LOG=production/renders/render.log
run() { "$B" -b "$M" --python production/pipeline/render.py -- "$@" 2>&1 | grep -E "PULSE_|Error|Traceback" >> "$LOG"; }
echo "start $(date)" > "$LOG"
run ring mats views final hero
run phys1 phys3 camp_product
run phys2 camp_space camp_arch
echo "stills done $(date)" >> "$LOG"
run hero phys1 --anim
echo "all done $(date)" >> "$LOG"
sha256sum -c production/pipeline/MASTER.sha256 >> "$LOG"
