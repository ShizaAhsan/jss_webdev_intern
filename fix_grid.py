import re
import os

filepath = 'C:/Users/User/VS_Projects/JSS_Internship_Web/program-details.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Line 62: program-hero-grid
content = content.replace(
    '<div class="program-hero-grid" style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 36px; align-items: center;">',
    '<div class="program-hero-grid" style="gap: 36px; align-items: center;">'
)

# Line 69: ph-stats
content = content.replace(
    '<div class="ph-stats" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">',
    '<div class="ph-stats" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 18px; gap: 12px; margin-bottom: 16px;">'
)

# Line 143: pd-layout-grid
content = content.replace(
    '<div style="display: grid; grid-template-columns: 1fr 380px; gap: 36px; align-items: start; margin-bottom: 40px;">',
    '<div class="pd-layout-grid" style="gap: 36px; align-items: start; margin-bottom: 40px;">'
)

# Line 166: outcomes-grid
content = content.replace(
    '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px;">',
    '<div class="outcomes-grid" style="gap: 12px 20px;">'
)

# Line 241: skills-grid
content = content.replace(
    '<div class="skills-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">',
    '<div class="skills-grid" style="gap: 24px;">'
)

# Line 816: pd-checkout-grid
content = content.replace(
    '<div style="display: grid; grid-template-columns: 1fr 1.6fr; gap: 24px; align-items: start;">',
    '<div class="pd-checkout-grid" style="gap: 24px; align-items: start;">'
)

# Line 835: pd-checkout-inner-grid
content = content.replace(
    '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">',
    '<div class="pd-checkout-inner-grid" style="gap: 12px; margin-bottom: 16px;">'
)

# Line 865: pd-checkout-card-grid
content = content.replace(
    '<div style="border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">',
    '<div class="pd-checkout-card-grid" style="border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; gap: 10px;">'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated program-details.html inline grids successfully")
