"""generate dots of various numbers and distributions for the dots activity"""
import os
import random
import matplotlib.pyplot as plt
import csv
import argparse
import math

# 命令行参数
# python backend/images/generate_dots.py -d uniform normal -n 15
parser = argparse.ArgumentParser(description='Generate dot images for estimation tasks.')
parser.add_argument('-d', '--distribution', nargs='+', default='uniform',
                    help='Distribution types to use (e.g. uniform normal). If not set, random for each image.')
parser.add_argument('-n', '--num', type=int, default=1,
                    help='Number of images to generate. If not set, random between 10 and 20.')
args = parser.parse_args()

# 配置
output_dir = 'backend/images'
csv_path = 'backend/questions.csv'
min_dots = 10
max_dots = 100

# 生成数量
if args.num is not None:
    num_images = args.num
else:
    num_images = random.randint(10, 20)

# 支持的分布类型
all_distributions = ['uniform', 'normal']
if args.distribution:
    distribution_types = [d for d in args.distribution if d in all_distributions]
    if not distribution_types:
        raise ValueError('No valid distribution type specified.')
else:
    distribution_types = all_distributions

# 保证输出目录存在
os.makedirs(output_dir, exist_ok=True)

# 随机生成不重复的点数
dot_counts = random.sample(range(min_dots, max_dots + 1), num_images)

# 记录题目信息
questions = []

def generate_points(n, dist_type, min_dist=0.05, max_attempts=1000):
    points = []
    attempts = 0
    while len(points) < n and attempts < max_attempts * n:
        if dist_type == 'uniform':
            x, y = random.uniform(0, 1), random.uniform(0, 1)
        elif dist_type == 'normal':
            x, y = random.gauss(0.5, 0.15), random.gauss(0.5, 0.15)
            # 保证在[0,1]范围内
            if not (0 <= x <= 1 and 0 <= y <= 1):
                attempts += 1
                continue
        else:
            raise ValueError('Unknown distribution')
        # 检查与已有点的距离
        if all(math.hypot(x - px, y - py) >= min_dist for px, py in points):
            points.append((x, y))
        attempts += 1
    if len(points) < n:
        raise RuntimeError(f'Could not place {n} points with min_dist={min_dist}')
    return zip(*points)

for i, count in enumerate(dot_counts):
    if len(distribution_types) == 1:
        dist_type = distribution_types[0]
    else:
        dist_type = random.choice(distribution_types)
    # 生成点，保证最小距离
    x, y = generate_points(count, dist_type, min_dist=0.05)
    filename = f'dots_{i+1:03d}.png'
    plt.figure(figsize=(3, 3))
    plt.scatter(list(x), list(y), s=30, c='black')
    plt.axis('off')
    plt.xlim(0, 1)
    plt.ylim(0, 1)
    plt.tight_layout(pad=0)
    plt.savefig(os.path.join(output_dir, filename), bbox_inches='tight', pad_inches=0)
    plt.close()
    questions.append({
        'filename': filename,
        'true_count': count,
        'distribution': dist_type
    })

# 写入CSV
with open(csv_path, 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=['filename', 'true_count', 'distribution'])
    writer.writeheader()
    for q in questions:
        writer.writerow(q)

print(f'Generated {num_images} images and saved to {output_dir}')
print(f'Question info saved to {csv_path}')
