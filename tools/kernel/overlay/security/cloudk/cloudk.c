#define pr_fmt(fmt) "cloudk: " fmt

#include <linux/init.h>
#include <linux/kernel.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <generated/utsrelease.h>
#include "cloudk_version.h"

static int cloudk_show(struct seq_file *m, void *v)
{
	seq_printf(m, "cloudk %s\nrelease %s\n", CLOUDK_VERSION, UTS_RELEASE);
	return 0;
}

static int __init cloudk_init(void)
{
	if (!proc_create_single("cloudk", 0444, NULL, cloudk_show))
		pr_warn("cannot create /proc/cloudk\n");
	pr_info("fork %s (%s)\n", CLOUDK_VERSION, UTS_RELEASE);
	return 0;
}
device_initcall(cloudk_init);
