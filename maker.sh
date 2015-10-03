#!/bin/bash
echo make: ready
while true; do
	make | awk '!/Nothing to be done/{print d, $0}' "d=$(date +%-d\ %b\ %H:%M:%S) -"
	sleep 2
done
