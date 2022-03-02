#!/bin/bash
BASEDIR=$(dirname $0)
$BASEDIR/bin/debug/linux/electron $BASEDIR/src/main.js --js-flags='--max_old_space_size=0 --expose-gc' --force_high_performance_gpu -debug
