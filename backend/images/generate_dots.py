"""generate dots of various numbers and distributions for the dots activity"""
import os
import numpy as np
import matplotlib.pyplot as plt


DOT_NUMBERS = [100]  # for each image. we may use range iterators or list comprehensions
DOT_SEP = 0.03  # don't overlap
PATH = '.'
SAMPLER = 'quarter'


def quadrant_cluster():
    cell_index = np.random.randint(0, 2, 2)
    pos = np.random.normal((cell_index*2+1)/4, 0.1, 2)
    return pos

DOT_SAMPLERS = {
    'uniform': lambda: np.random.uniform(0, 1, 2),
    'normal': lambda: np.random.normal(0.5, 0.2, 2),
    'quarter': quadrant_cluster,
}


if __name__ == "__main__":
    os.chdir(PATH)
    for n_dots in DOT_NUMBERS:
        existing_locations = []
        dots = len(existing_locations)

        #add each dot
        plt.clf()
        while len(existing_locations) != n_dots:
            new_location = DOT_SAMPLERS[SAMPLER]()
            if not np.all((0 < new_location) & (new_location < 1)):
                continue

            #check to ensure new dot is not too close to others
            distances = [np.linalg.norm(loc - new_location) for loc in existing_locations]
            if any([dist < DOT_SEP for dist in distances]):
                continue

            existing_locations.append(new_location)    
            plt.plot(*new_location, 'ko', markersize=DOT_SEP*100, markeredgewidth=0)  # unpack the coordinates

            
        axes = plt.gca()
        axes.set_xlim([-0.02,1.02])
        axes.set_ylim([-0.02,1.02])

        plt.axes().set_aspect('equal')
        plt.axis('off')
        plt.savefig(str(n_dots), bbox_inches='tight', pad_inches=0)
