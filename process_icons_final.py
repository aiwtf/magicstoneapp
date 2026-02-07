import os
import shutil
from PIL import Image

# Directories
ARTIFACT_DIR = r"C:\Users\User\.gemini\antigravity\brain\9a9a2671-857f-46e4-a87a-5bb72967dd6d"
PUBLIC_DIR = r"C:\Users\User\Desktop\magicstoneapp\public"

# Artifact Mappings (Based on recent analysis)
# Transparent Source (Web)
ARTIFACT_TRANS = os.path.join(ARTIFACT_DIR, "media__1770458619443.png")
# Black Source (Mobile)
ARTIFACT_BLACK = os.path.join(ARTIFACT_DIR, "media__1770458626885.png")

# Target Sources in Public
TARGET_TRANS = os.path.join(PUBLIC_DIR, "trans.png")
TARGET_BLACK = os.path.join(PUBLIC_DIR, "black.png")

def ensure_sources():
    # Ensure trans.png exists
    if not os.path.exists(TARGET_TRANS):
        if os.path.exists(ARTIFACT_TRANS):
            print(f"Copying {ARTIFACT_TRANS} to {TARGET_TRANS}")
            shutil.copy(ARTIFACT_TRANS, TARGET_TRANS)
        else:
            print(f"Error: Artifact {ARTIFACT_TRANS} not found!")
            return False
            
    # Ensure black.png exists
    if not os.path.exists(TARGET_BLACK):
        if os.path.exists(ARTIFACT_BLACK):
            print(f"Copying {ARTIFACT_BLACK} to {TARGET_BLACK}")
            shutil.copy(ARTIFACT_BLACK, TARGET_BLACK)
        else:
            print(f"Error: Artifact {ARTIFACT_BLACK} not found!")
            return False
    return True

def process():
    if not ensure_sources():
        return

    print("--- WEB ICONS (from trans.png) ---")
    img_trans = Image.open(TARGET_TRANS).convert("RGBA")
    
    # 1. favicon.ico (32x32)
    img_trans.save(os.path.join(PUBLIC_DIR, "favicon.ico"), format='ICO', sizes=[(32,32)])
    print("Saved favicon.ico")

    # 2. icon.png (192x192)
    img_trans.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "icon.png"), "PNG")
    print("Saved icon.png")
    
    # icon-32x32.png for completeness
    img_trans.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "icon-32x32.png"), "PNG")


    print("--- MOBILE ICONS (from black.png) ---")
    img_black = Image.open(TARGET_BLACK).convert("RGB")
    
    # 3. apple-touch-icon.png (180x180)
    img_black.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), "PNG")
    print("Saved apple-touch-icon.png")
    
    # 4. android-chrome-192x192.png
    img_black.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "android-chrome-192x192.png"), "PNG")
    print("Saved android-chrome-192x192.png")
    
    # 5. android-chrome-512x512.png
    img_black.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "android-chrome-512x512.png"), "PNG")
    print("Saved android-chrome-512x512.png")

    print("Explicit Mapping Completed.")

if __name__ == "__main__":
    process()
