#!/bin/bash
BASEDIR=$(dirname $0)
$BASEDIR/bin/debug/linux/electron $BASEDIR/src/main.js --js-flags='--max_old_space_size=0 --expose-gc' --force_high_performance_gpu -debug -x 1440 -y 25 $0 $1 $2 $3 $4 $5 $6 $7 $8 $9