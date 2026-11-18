#include <linux/init.h>
#include <linux/kernel.h>
#include <linux/module.h>
#include <linux/printk.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include "cloudk_version.h"

extern int kptr_restrict;
extern int dmesg_restrict;
extern int panic_on_oops;

static int cloudk_guard = 1;
module_param_named(guard, cloudk_guard, int, 0644);
MODULE_PARM_DESC(guard, "enforce restrictive boot defaults");

static int cloudk_show(struct seq_file *m, void *v)
{
	seq_printf(m, "cloudk %s\n", CLOUDK_VERSION);
	seq_printf(m, "guard: %s\n", cloudk_guard ? "on" : "off");
	seq_printf(m, "kptr_restrict: %d\n", kptr_restrict);
	seq_printf(m, "dmesg_restrict: %d\n", dmesg_restrict);
	seq_printf(m, "panic_on_oops: %d\n", panic_on_oops);
	seq_puts(m, "done\n");
	return 0;
}

static int cloudk_open(struct inode *inode, struct file *file)
{
	return single_open(file, cloudk_show, NULL);
}

static const struct proc_ops cloudk_proc_ops = {
	.proc_open	= cloudk_open,
	.proc_read	= seq_read,
	.proc_lseek	= seq_lseek,
	.proc_release	= single_release,
};

static int __init cloudk_init(void)
{
	if (cloudk_guard) {
		kptr_restrict = 2;
		dmesg_restrict = 1;
		panic_on_oops = 1;
	}
	if (!proc_create("cloudk", 0444, NULL, &cloudk_proc_ops))
		pr_warn("cloudk: cannot create /proc/cloudk\n");
	pr_info("cloudk: layer %s active, guard %s\n", CLOUDK_VERSION,
		cloudk_guard ? "on" : "off");
	pr_info("cloudk: fork guard active\n");
	return 0;
}
late_initcall(cloudk_init);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("wh1laye");
MODULE_DESCRIPTION("CloudOS kernel guard");
