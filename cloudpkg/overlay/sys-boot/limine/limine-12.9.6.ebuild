# Copyright 1999-2026 Gentoo Authors, CloudOS
# Distributed under the terms of the GNU General Public License v2

EAPI=8

inherit toolchain-funcs

DESCRIPTION="Limine bootloader (prebuilt binary release, builds without llvm)"
HOMEPAGE="https://limine-bootloader.org https://github.com/limine-bootloader/limine"
SRC_URI="https://github.com/limine-bootloader/limine/releases/download/v${PV}/limine-binary.tar.gz -> ${P}-binary.tar.gz"
S="${WORKDIR}/limine-binary"

LICENSE="BSD-2"
SLOT="0"
KEYWORDS="amd64"
RESTRICT="strip"
QA_PREBUILT="*"

src_compile() {
	$(tc-getCC) ${CFLAGS} -std=c99 -D_FILE_OFFSET_BITS=64 ${LDFLAGS} limine.c -o limine || die
}

src_install() {
	dobin limine
	insinto /usr/share/limine
	doins BOOTX64.EFI BOOTIA32.EFI BOOTAA64.EFI BOOTRISCV64.EFI BOOTLOONGARCH64.EFI \
		limine-bios.sys limine-bios-cd.bin limine-uefi-cd.bin limine-bios-pxe.bin limine-bios-hdd.h
	dodoc LICENSE 3RDPARTY.md
}
