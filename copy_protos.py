import os
import shutil

def copy_protos(dest_dirs):
  src_dir = os.path.join(os.getcwd(), 'protos')

  # Kiểm tra thư mục nguồn
  if not os.path.exists(src_dir):
    print(f"??? [WARN] Thư mục nguồn không tồn tại: {src_dir}")
    return

  for dest_root in dest_dirs:
    dest_dir = os.path.join(os.getcwd(), dest_root, 'protos')

    # Xóa thư mục đích cũ nếu tồn tại
    if os.path.exists(dest_dir):
      shutil.rmtree(dest_dir)

    # Tạo thư mục đích mới
    os.makedirs(dest_dir, exist_ok=True)

    # Sao chép toàn bộ nội dung
    shutil.copytree(src_dir, dest_dir, dirs_exist_ok=True)
    print(f">>> [OK] Đã sao chép {src_dir} → {dest_dir}")


def copy_files_or_folders(sources, destination_folder):
  os.makedirs(destination_folder, exist_ok=True)
  for src in sources:
    if not os.path.exists(src):
      print(f"??? [WARN] Nguồn không tồn tại: {src}")
      continue
    dest_path = os.path.join(destination_folder, os.path.basename(src))
    if os.path.isdir(src):
      if os.path.exists(dest_path):
        shutil.rmtree(dest_path)
      shutil.copytree(src, dest_path)
      print(f">>> [OK] Đã sao chép thư mục {src} → {dest_path}")
    else:
      shutil.copy2(src, dest_path)
      print(f">>> [OK] Đã sao chép tệp {src} → {dest_path}")


if __name__ == '__main__':
  # danh sách các thư mục mircoservice đích
  dest_dirs = ['media-service', 'admin-service', 'conversation-service', 'chat-service', 'call-service']
  copy_protos(dest_dirs)

  # danh sách tệp/thư mục cần sao chép
  sources = ['protos']
  # sao chép vào thư mục server chính
  destination_folder = os.path.join(os.getcwd(), '..', 'server')
  copy_files_or_folders(sources, destination_folder)