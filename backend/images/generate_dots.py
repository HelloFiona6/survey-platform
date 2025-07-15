"""
Generate dots of various numbers and distributions for the dots activity
CCurrently, dots are named by
"""
import os, argparse, csv

import numpy as np
import matplotlib.pyplot as plt

# 命令行参数
# python backend/images/generate_dots.py -d uniform normal -n 15
parser = argparse.ArgumentParser(description='Generate dot images for estimation tasks.')
parser.add_argument('-d', '--distribution', nargs='+', default='uniform',
                    help='Distribution types to use (e.g. uniform normal). If not set, random for each image.')
parser.add_argument('-n', '--num', type=int, default=1,
                    help='Number of images to generate. If not set, random between 10 and 20.')
args = parser.parse_args()


DOT_NUMBERS = range(40,60)  # for each image. we may use range iterators or list comprehensions
DOT_SEP = 0.03  # don't overlap
PATH = '.'
SAMPLER = 'uniform'
DOT_SAMPLERS = {
    'uniform': lambda: np.random.uniform(0, 1, 2),
    'normal': lambda: np.random.normal(0.5, 0.2, 2),
    'quarter': lambda: np.random.normal((np.random.randint(0, 2, 2)+0.5)/2, 0.1),
}

parser = argparse.ArgumentParser(description="Generate dot images with customizable parameters.")
parser.add_argument(
    '-n', '--dot-numbers',
    nargs='+',  # Allows one or more arguments
    type=int,
    dest="DOT_NUMBERS",
    default=DOT_NUMBERS,
    help='A list of integers, representing the number of dots for each image to be generated. '
         'Example: -n 50 100 200 (generates 3 images)'
)
parser.add_argument(
    '-s', '--dot_separation',
    type=float,
    dest="DOT_SEP",
    default=DOT_SEP,
    help='A float representing a conceptual minimum separation between dots. '
         "Note: It's used to verify and sift dots, not to control sampling."
)
parser.add_argument(
    '-p', '--path',
    type=str,
    dest="PATH",
    default=PATH,
    help='The directory path where the generated images will be saved. '
         'Defaults to the current directory.'
)
parser.add_argument(
    '-a', '--sampler',
    type=str,
    choices=DOT_SAMPLERS.keys(),
    dest="SAMPLER",
    default=SAMPLER,
    help=f'The sampling method used for generating dot positions. '
         f'Allowed values: {", ".join(DOT_SAMPLERS.keys())}.'
)


if __name__ == "__main__":
    args = parser.parse_args()
    # os.makedirs(args.PATH, exist_ok=True)
    index = {"filename":[], "n_dots":[], "sampler":[]}
    for idx, n_dots in enumerate(args.DOT_NUMBERS):
        sampler = args.SAMPLER
        existing_locations = []
        dots = len(existing_locations)

        #add each dot
        plt.clf()
        while len(existing_locations) != n_dots:
            new_location = DOT_SAMPLERS[sampler]()
            if not np.all((0 < new_location) & (new_location < 1)):
                continue

            #check to ensure new dot is not too close to others
            distances = [np.linalg.norm(loc - new_location) for loc in existing_locations]
            if any([dist < args.DOT_SEP for dist in distances]):
                continue

        axes = plt.gca()
        axes.set_xlim([-0.05,1.05])
        axes.set_ylim([-0.05,1.05])
        axes.set_aspect('equal')
        plt.axis('off')

        filename = f"NO_{idx}.png"
        plt.savefig(os.path.join(args.PATH, filename), bbox_inches='tight', pad_inches=0)
        index["filename"].append(filename)
        index["n_dots"].append(n_dots)
        index["sampler"].append(SAMPLER)

    with open(os.path.join(args.PATH, "index.csv"), "w") as f:
        writer = csv.writer(f)
        headers = index.keys()
        writer.writerow(headers)
        writer.writerows(zip(*(index[field] for field in headers)))
