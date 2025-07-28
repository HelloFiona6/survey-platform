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

DOT_NUMBERS = range(40, 60)  # for each image. we may use range iterators or list comprehensions
DOT_SEP = 0.03  # don't overlap
PATH = '.'
DISTRIBUTION = 'uniform'


class UniformSampler:
    def __call__(self):
        return np.random.uniform(0, 1, 2)


class NormalSampler:
    def __call__(self):
        return np.random.normal(0.5, 0.2, 2)


class QuarterSampler:
    def __call__(self):
        return np.random.normal((np.random.randint(0, 2, 2) + 0.5) / 2, 0.1)


class UnevenDoubleSampler:
    def __init__(self):
        self.p = np.random.randint(2, 8) / 10  # randomize the unevenness
        self.centers = np.random.beta(0.6, 0.6, (2, 2)) * 0.4 + 0.3  # centers in [0.3, 0.7] range

    def __call__(self):
        cluster_index = 0 if np.random.rand() < self.p else 1
        return np.random.normal(self.centers[cluster_index], 0.1)


class MoonSampler:
    centers = np.array([0.5, 0.5])

    def __init__(self):
        phi = np.random.uniform(0, 2 * np.pi)
        self.rotation = np.array([
            [np.cos(phi), -np.sin(phi)],
            [np.sin(phi), np.cos(phi)]
        ])

    def __call__(self):
        theta = np.random.uniform(-np.pi, np.pi)
        vec = np.array([np.cos(theta), np.sin(theta)]) * 0.25
        base = np.array([-0.13 if theta < 0 else 0.13, 0])
        return MoonSampler.centers + np.random.normal(base + vec, 0.05) @ self.rotation


DOT_SAMPLERS = {
    'uniform': UniformSampler,
    'normal': NormalSampler,
    'quarter': QuarterSampler,
    'uneven2': UnevenDoubleSampler,
    'moon': MoonSampler,
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
    help='The existing directory path where the generated images will be saved. '
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
    sampler_name = args.DISTRIBUTION
    init_index()
    for n_dots in args.DOT_NUMBERS:
        existing_locations = []
        dots = len(existing_locations)

        # add each dot
        plt.clf()
        sampler = DOT_SAMPLERS[sampler_name]()  # actually, it's a callable object, not a function.
        while len(existing_locations) != n_dots:
            new_location = sampler()
            if not np.all((0 < new_location) & (new_location < 1)):
                continue

            # check to ensure new dot is not too close to others
            distances = [np.linalg.norm(loc - new_location) for loc in existing_locations]
            if any([dist < args.DOT_SEP for dist in distances]):
                continue

            existing_locations.append(new_location)

        plt.plot(*zip(*existing_locations), 'ko', markersize=min(args.DOT_SEP * 180, 5), markeredgewidth=0)
        axes = plt.gca()
        axes.set_xlim([-0.05, 1.05])
        axes.set_ylim([-0.05, 1.05])
        axes.set_aspect('equal')
        plt.axis('off')

        filename = f"{uuid.uuid1()}.png"
        plt.savefig(os.path.join(args.PATH, filename), bbox_inches='tight', pad_inches=0)
        append_index_row(filename, n_dots, sampler_name)
