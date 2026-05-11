#!/usr/bin/env python3
"""
iPhone → Mac Photo Transfer
Transfers photos/videos from iPhone to your Mac over USB.

Requirements:
    pip install pymobiledevice3

Usage:
    python transfer_photos.py                        # → ~/Pictures/iPhone_Photos
    python transfer_photos.py ~/Desktop/my-photos    # custom destination
    python transfer_photos.py --dry-run              # count files, don't copy
    python transfer_photos.py --flat                 # skip date folders
"""

import sys
import os
import argparse
from pathlib import Path
from datetime import datetime


PHOTO_EXTENSIONS = {
    ".jpg", ".jpeg", ".heic", ".heif", ".png", ".gif", ".bmp", ".tiff", ".tif",
    ".mov", ".mp4", ".m4v", ".3gp", ".avi",
    ".dng", ".raw",
    ".aae",  # Apple edit sidecar
}


def require_pymobiledevice3():
    try:
        import pymobiledevice3  # noqa: F401
    except ImportError:
        print("pymobiledevice3 is not installed.")
        print("Install it with:  pip install pymobiledevice3")
        sys.exit(1)


def connect(udid: str | None = None):
    from pymobiledevice3.lockdown import create_using_usbmux

    print("Looking for iPhone over USB...")
    try:
        lockdown = create_using_usbmux(serial=udid)
        info = lockdown.short_info
        print(f"Connected: {info.get('DeviceName', 'iPhone')}  "
              f"(iOS {info.get('ProductVersion', '?')})")
        return lockdown
    except Exception as exc:
        print(f"Could not connect: {exc}")
        print()
        print("Checklist:")
        print("  1. Plug iPhone into Mac with a USB cable")
        print("  2. Unlock iPhone and tap 'Trust This Computer'")
        print("  3. Run this script again")
        sys.exit(1)


def scan_dcim(afc):
    """Return a list of all media file paths under /DCIM."""
    paths = []
    try:
        folders = afc.listdir("/DCIM")
    except Exception as exc:
        print(f"Cannot read /DCIM: {exc}")
        sys.exit(1)

    for folder in sorted(folders):
        folder_path = f"/DCIM/{folder}"
        try:
            files = afc.listdir(folder_path)
        except Exception:
            continue
        for filename in files:
            if Path(filename).suffix.lower() in PHOTO_EXTENSIONS:
                paths.append(f"{folder_path}/{filename}")

    return paths


def dest_for(afc, remote_path: str, dest_root: Path, organize: bool) -> Path:
    """Return the local destination path for a remote file."""
    filename = remote_path.rsplit("/", 1)[-1]
    if not organize:
        return dest_root / filename

    try:
        stat = afc.stat(remote_path)
        mtime = stat.st_mtime
        date = datetime.fromtimestamp(mtime)
        folder = dest_root / str(date.year) / f"{date.month:02d}"
    except Exception:
        folder = dest_root / "unknown"

    return folder / filename


def transfer(lockdown, dest_root: Path, organize: bool, dry_run: bool):
    from pymobiledevice3.services.afc import AfcService

    afc = AfcService(lockdown)

    print("Scanning iPhone for photos and videos...")
    all_files = scan_dcim(afc)
    total = len(all_files)

    if total == 0:
        print("No photos found on the device.")
        return

    print(f"Found {total:,} files")
    if dry_run:
        print("--dry-run: nothing will be copied.")
        return

    dest_root.mkdir(parents=True, exist_ok=True)

    copied = skipped = errors = 0
    REPORT_EVERY = 250

    for i, remote_path in enumerate(all_files, 1):
        local_path = dest_for(afc, remote_path, dest_root, organize)

        if local_path.exists():
            skipped += 1
        else:
            try:
                local_path.parent.mkdir(parents=True, exist_ok=True)
                data = afc.get_file_contents(remote_path)
                local_path.write_bytes(data)
                copied += 1
            except Exception as exc:
                errors += 1
                if errors <= 10:
                    print(f"  ! error copying {remote_path.rsplit('/', 1)[-1]}: {exc}")

        if i % REPORT_EVERY == 0 or i == total:
            pct = i / total * 100
            print(f"  [{pct:5.1f}%] {i:>{len(str(total))}}/{total:,} "
                  f"— {copied:,} copied  {skipped:,} skipped  {errors} errors")

    print()
    print(f"Done.  {copied:,} copied, {skipped:,} already existed, {errors} errors")
    print(f"Saved to: {dest_root}")


def list_devices():
    """Print connected device UDIDs (useful when multiple devices are plugged in)."""
    try:
        from pymobiledevice3.usbmux import select_devices_by_connection_type
        devices = select_devices_by_connection_type(connection_type="USB")
        if not devices:
            print("No USB devices found.")
        for d in devices:
            print(d.serial)
    except Exception as exc:
        print(f"Could not list devices: {exc}")


def main():
    parser = argparse.ArgumentParser(
        description="Transfer all photos/videos from iPhone to Mac over USB.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "destination",
        nargs="?",
        default=str(Path.home() / "Pictures" / "iPhone_Photos"),
        metavar="DEST",
        help="Where to save photos (default: ~/Pictures/iPhone_Photos)",
    )
    parser.add_argument(
        "--udid",
        metavar="UDID",
        help="Target a specific device by UDID (use --list-devices to find it)",
    )
    parser.add_argument(
        "--list-devices",
        action="store_true",
        help="Print connected device UDIDs and exit",
    )
    parser.add_argument(
        "--flat",
        action="store_true",
        help="Put all files in DEST directly (no year/month sub-folders)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Count files without copying anything",
    )
    args = parser.parse_args()

    require_pymobiledevice3()

    if args.list_devices:
        list_devices()
        return

    lockdown = connect(udid=args.udid)
    transfer(
        lockdown,
        dest_root=Path(args.destination),
        organize=not args.flat,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
