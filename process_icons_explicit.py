import os
from PIL import Image

# Sources (User stated they are in public/)
PUBLIC_DIR = r"C:\Users\User\Desktop\magicstoneapp\public"
SRC_TRANSPARENT = os.path.join(PUBLIC_DIR, "trans.png")
SRC_BLACK = os.path.join(PUBLIC_DIR, "black.png")

# Fallback to artifacts if not in public (Safety net)
ARTIFACT_DIR = r"C:\Users\User\.gemini\antigravity\brain\9a9a2671-857f-46e4-a87a-5bb72967dd6d"
if not os.path.exists(SRC_TRANSPARENT):
    # Try finding latest pngs in artifacts
    print("Warning: public/trans.png not found. Checking artifacts...")
    # Logic to find artifacts if needed, but user said "manually prepared". 
    # Let's assume they might be named differently or I need to find them.
    # For now, let's try to proceed with explicit paths, if fail, fail loudly so I know.
    pass

def process():
    if not os.path.exists(SRC_TRANSPARENT):
        print(f"Error: Transparent source missing at {SRC_TRANSPARENT}")
        return
    if not os.path.exists(SRC_BLACK):
        print(f"Error: Black source missing at {SRC_BLACK}")
        return

    print("--- WEB ICONS (from trans.png) ---")
    img_trans = Image.open(SRC_TRANSPARENT).convert("RGBA")
    
    # 1. favicon.ico (32x32)
    # Saving as .ico with valid sizes
    img_trans.save(os.path.join(PUBLIC_DIR, "favicon.ico"), format='ICO', sizes=[(32,32)])
    print("Saved favicon.ico")

    # 2. icon.png (192x192 - High Res Web)
    # User said "32x32 or 192x192". 192 is better for modern web.
    img_trans.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "icon.png"), "PNG")
    print("Saved icon.png")


    print("--- MOBILE ICONS (from black.png) ---")
    img_black = Image.open(SRC_BLACK).convert("RGB")
    
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
