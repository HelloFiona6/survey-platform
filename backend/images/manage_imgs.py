"""
Works in backend/images directory
"""

import argparse
import csv
import glob
import os

INDEX_FILE = 'index.csv'

FILENAME_KEY = 'filename'
GROUND_TRUTH_KEY = 'dot_number'
DISTRIBUTION_KEY = 'distribution'
CSV_HEADER = [FILENAME_KEY, GROUND_TRUTH_KEY, DISTRIBUTION_KEY]


def init_index():
    if os.path.isfile(INDEX_FILE):
        return
    with open(INDEX_FILE, 'w') as f:
        writer = csv.DictWriter(f, CSV_HEADER)
        writer.writeheader()


def append_index_row(filename: str, dot_number: int, distribution: str):
    with open(INDEX_FILE, 'a') as f:
        writer = csv.DictWriter(f, CSV_HEADER)
        writer.writerow({
            FILENAME_KEY: filename,
            GROUND_TRUTH_KEY: dot_number,
            DISTRIBUTION_KEY: distribution
        })


def refresh_index():
    index_file = INDEX_FILE
    valid_rows = []
    with open(INDEX_FILE, newline='') as csvfile:
        reader = csv.DictReader(csvfile, fieldnames=CSV_HEADER)
        for row in reader:
            filename = row[FILENAME_KEY]
            if os.path.isfile(filename):
                valid_rows.append(row)
            else:
                print(f'Missing {filename}')

    with open(INDEX_FILE, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=CSV_HEADER)
        writer.writeheader()
        for row in valid_rows:
            writer.writerow(row)


def remove_unindexed():
    index_file = INDEX_FILE
    with open(INDEX_FILE, newline='') as csvfile:
        reader = csv.DictReader(csvfile, fieldnames=CSV_HEADER)
        indexed_imgs = set(row[FILENAME_KEY] for row in reader)

    all_imgs = set(glob.glob('*.png'))
    for filename in all_imgs.difference(indexed_imgs):
        os.remove(filename)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="The backend/image manager, supports deleting and index updating.",
        formatter_class=argparse.RawTextHelpFormatter  # For better multiline help messages
    )

    # Create subparsers for different commands
    subparsers = parser.add_subparsers(
        dest='command',  # This will store the name of the chosen subparser (e.g., 'refresh')
        help='Available commands'
    )

    # ==================== 'refresh' command ====================
    refresh_parser = subparsers.add_parser(
        'refresh',
        help='Ensure only indexing existing images.'
    )

    # ==================== 'sync' command ====================
    sync_parser = subparsers.add_parser(
        'sync',
        help='Synchronize index and files by refreshing index and deleting wild images'
    )

    args = parser.parse_args()

    if hasattr(args, 'command'):
        if args.command == 'refresh':
            refresh_index()
        elif args.command == 'sync':
            refresh_index()
            remove_unindexed()
        else:
            parser.print_help()
            exit(2)
    else:
        parser.print_help()
        exit(1)
