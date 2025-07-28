"""
Works in backend/images directory.
Perhaps I should just reuse survey.db ... I'm just afraid of too much coupling.
"""

import argparse
import csv
import glob
import os
import sys

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
        writer = csv.DictWriter(f, CSV_HEADER, lineterminator='\n')
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
        for row in reader:  # the headers will also be read, but not fix it now. it prevents name conflicts anyway.
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


def find_entries(query: dict) -> list[dict]:
    def match(q: dict, r: dict):
        return all(str(q[k]) == r[k] for k in q.keys() & r.keys())

    with open(INDEX_FILE, 'r') as f:
        reader = csv.DictReader(f, CSV_HEADER)
        return [row for row in reader if match(query, row)]


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

    refresh_parser = subparsers.add_parser(
        'refresh',
        help='Ensure only indexing existing images.'
    )

    sync_parser = subparsers.add_parser(
        'sync',
        help='Synchronize index and files by refreshing index and deleting unindexed images'
    )

    find_parser = subparsers.add_parser(
        'find',
        help='Search index and return matching items'
    )
    find_parser.add_argument(
        '-n', '--dot_number',
        type=int,
        dest=GROUND_TRUTH_KEY,
        help='The number of dots in the image'
    )
    find_parser.add_argument(
        '-a', '--distribution',
        type=str,
        dest=DISTRIBUTION_KEY,
        help="The dots' distributions"
    )
    find_parser.add_argument(
        '-f', '--file-name',
        type=str,
        dest=FILENAME_KEY,
        help='Name of the queried image file'
    )

    args = parser.parse_args()

    if hasattr(args, 'command'):
        if args.command == 'refresh':
            refresh_index()
        elif args.command == 'sync':
            refresh_index()
            remove_unindexed()
        elif args.command == 'find':
            keys = {k: getattr(args, k) for k in CSV_HEADER if getattr(args, k)}
            if len(keys) == 0:
                print('no keys provided')
                parser.print_help()
                exit(3)
            result = find_entries(keys)
            if len(result) > 0:
                printer = csv.DictWriter(sys.stdout, CSV_HEADER)
                printer.writeheader()
                printer.writerows(result)
            else:
                print('No matches')
        else:
            parser.print_help()
            exit(2)
    else:
        parser.print_help()
        exit(1)
