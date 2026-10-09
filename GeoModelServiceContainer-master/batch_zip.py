import os
import zipfile

def zip_folder(source_folder, output_zip):
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(source_folder):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, start=source_folder)
                zipf.write(abs_path, rel_path)

def get_unique_zip_name(upload_dir, base_name):
    count = 0
    while True:
        if count == 0:
            zip_name = f"{base_name}.zip"
        else:
            zip_name = f"{base_name}_{count}.zip"
        zip_path = os.path.join(upload_dir, zip_name)
        if not os.path.exists(zip_path):
            return zip_path
        count += 1

def main():
    base_dir = os.getcwd()  # 当前目录
    upload_dir = os.path.join(base_dir, 'upload')
    os.makedirs(upload_dir, exist_ok=True)

    for item in os.listdir(base_dir):
        item_path = os.path.join(base_dir, item)
        if os.path.isdir(item_path) and '_' in item:
            # 获取压缩后的基础名称（去掉后缀 _xxxx）
            base_name = item.split('_')[0].strip()
            zip_path = get_unique_zip_name(upload_dir, base_name)
            zip_folder(item_path, zip_path)
            print(f"✅ 压缩完成：{zip_path}")

if __name__ == '__main__':
    main()
