# 删除图片以及对应的question.csv中的记录
import csv
import os

# 配置
images_dir = 'backend/images'
csv_path = 'backend/questions.csv'

# 要删除的图片文件名列表（可手动填写或从命令行参数读取）
# 例如：['dots_001.png', 'dots_002.png']
delete_filenames = [
    'dots_001.png',
    'dots_002.png'
]

# 1. 删除图片文件
for fname in delete_filenames:
    img_path = os.path.join(images_dir, fname)
    if os.path.exists(img_path):
        os.remove(img_path)
        print(f"Deleted image: {img_path}")
    else:
        print(f"Image not found: {img_path}")

# 2. 读取 questions.csv，过滤掉要删除的图片
rows = []
with open(csv_path, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row['filename'] not in delete_filenames:
            rows.append(row)

# 3. 写回 questions.csv
with open(csv_path, 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=['filename', 'true_count', 'distribution'])
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

print("Updated questions.csv.")
