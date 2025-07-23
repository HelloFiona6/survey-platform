"""
Generate dots of various numbers and distributions for the dots activity
Currently, subscripts name dot images.
"""
import argparse
import os
import uuid

import matplotlib.pyplot as plt
import numpy as np

from manage_imgs import append_index_row, init_index

DOT_NUMBERS = range(40,60)  # for each image. we may use range iterators or list comprehensions
DOT_SEP = 0.03  # don't overlap
PATH = '.'
DISTRIBUTION = 'uniform'

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
    '-a', '--distribution',
    type=str,
    choices=DOT_SAMPLERS.keys(),
    dest="DISTRIBUTION",
    default=DISTRIBUTION,
    help=f'The sampling method used for generating dot positions. '
         f'Allowed values: {", ".join(DOT_SAMPLERS.keys())}.'
)


if __name__ == "__main__":
    args = parser.parse_args()
    # os.makedirs(args.PATH, exist_ok=True)
    sampler_name = args.DISTRIBUTION
    init_index()
    for n_dots in args.DOT_NUMBERS:
        existing_locations = []
        dots = len(existing_locations)

        #add each dot
        plt.clf()
        while len(existing_locations) != n_dots:
            new_location = DOT_SAMPLERS[sampler_name]()
            if not np.all((0 < new_location) & (new_location < 1)):
                continue

            #check to ensure new dot is not too close to others
            distances = [np.linalg.norm(loc - new_location) for loc in existing_locations]
            if any([dist < args.DOT_SEP for dist in distances]):
                continue

            existing_locations.append(new_location)
            plt.plot(*new_location, 'ko', markersize=DOT_SEP*100, markeredgewidth=0)

        axes = plt.gca()
        axes.set_xlim([-0.05,1.05])
        axes.set_ylim([-0.05,1.05])
        axes.set_aspect('equal')
        plt.axis('off')

        filename = f"{uuid.uuid1()}.png"
        plt.savefig(os.path.join(args.PATH, filename), bbox_inches='tight', pad_inches=0)
        append_index_row(filename, n_dots, sampler_name)
