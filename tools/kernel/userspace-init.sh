#!/bin/busybox sh
/bin/busybox --install -s /bin
export PATH=/bin
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t devtmpfs devtmpfs /dev 2>/dev/null
mount -t securityfs securityfs /sys/kernel/security 2>/dev/null
echo "CLOUDK-START"
echo "CLOUDK-UNAME: $(uname -r)"
echo "CLOUDK-PROC: $(cat /proc/cloudk 2>/dev/null | tr '\n' ' ')"
echo "CLOUDK-BORE: $(cat /proc/sys/kernel/sched_bore 2>/dev/null || echo none)"
echo "CLOUDK-LOCKDOWN: $(cat /sys/kernel/security/lockdown 2>/dev/null || echo none)"
echo "CLOUDK-LSM: $(cat /sys/kernel/security/lsm 2>/dev/null || echo none)"
echo "CLOUDK-DONE"
sync
poweroff -f
echo o > /proc/sysrq-trigger
sleep 30
