#!/bin/bash
BASEDIR=$(dirname $0)
echo $BASEDIR
$BASEDIR/bin/debug/linux/electron $BASEDIR/src/application.js --js-flags='--max_old_space_size=0 --expose-gc' --force_high_performance_gpu -debug -x 740 -y 200 $0 $1 $2 $3 $4 $5 $6 $7 $8 $9