import os
import shutil

def copy_protos(dest_dirs):
  src_dir = os.path.join(os.getcwd(), 'protos')

  # Kiểm tra thư mục nguồn
  if not os.path.exists(src_dir):
    print(f"[WARN] Thư mục nguồn không tồn tại: {src_dir}")
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
    print(f"[OK] Đã sao chép {src_dir} → {dest_dir}")

if __name__ == '__main__':
  # Ví dụ danh sách thư mục đích
  dest_dirs = [
    'admin-service',
    # 'auth_service',
    'call-service',
    'chat-service',
    'conversation-service',
    # 'friendship-service',
    'media-service',
    'notification_service',
    'search-service',
    # 'user-service',
    'user-auth-service',
  ]
  copy_protos(dest_dirs)
