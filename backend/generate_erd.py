"""Generate a PDF ERD of the SMRS database schema.

Reads the live schema from the configured database (Postgres smrs_db),
draws one ERD for the business tables and one for the Django framework
tables, and writes a multi-page PDF (database-ERD.pdf) to the repo root.

Run from the backend/ directory:  python generate_erd.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

# --------------------------------------------------------------------------
# 1. Load live schema
# --------------------------------------------------------------------------
cur = connection.cursor()

cur.execute(
    "select table_name from information_schema.tables "
    "where table_schema='public' and table_type='BASE TABLE' order by table_name"
)
tables = [r[0] for r in cur.fetchall()]

schema = {}
for t in tables:
    cur.execute(
        "select column_name, data_type from information_schema.columns "
        "where table_name=%s order by ordinal_position", [t])
    cols = cur.fetchall()
    cur.execute(
        "select kcu.column_name from information_schema.table_constraints tc "
        "join information_schema.key_column_usage kcu "
        "on tc.constraint_name=kcu.constraint_name "
        "where tc.table_name=%s and tc.constraint_type='PRIMARY KEY' "
        "and tc.table_schema='public'", [t])
    pks = {r[0] for r in cur.fetchall()}
    cur.execute(
        "select kcu.column_name, ccu.table_name, ccu.column_name "
        "from information_schema.table_constraints tc "
        "join information_schema.key_column_usage kcu "
        "on tc.constraint_name=kcu.constraint_name "
        "join information_schema.constraint_column_usage ccu "
        "on tc.constraint_name=ccu.constraint_name "
        "where tc.table_name=%s and tc.constraint_type='FOREIGN KEY' "
        "and tc.table_schema='public'", [t])
    fks = {r[0]: (r[1], r[2]) for r in cur.fetchall()}
    schema[t] = {'cols': cols, 'pks': pks, 'fks': fks}

# --------------------------------------------------------------------------
# 2. matplotlib drawing
# --------------------------------------------------------------------------
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

ROW_H = 0.40
HEAD_H = 0.62
PAD = 0.12
FS = 5.2
FS_HEAD = 6.8
GAP = 1.6                       # vertical gap between stacked boxes
PK_COLOR = '#b00020'
FK_COLOR = '#0a7a0a'
KEY_COLOR = '#123a5c'
PLAIN = '#222222'
EDGE_COLOR = '#8494a6'

# override labels shown in table headers
LABEL = {
    'users': 'users (accounts)',
}


def box_label(t):
    return LABEL.get(t, t)


def column_display(t, col):
    """Return (text, color, weight) for a column line."""
    d = schema[t]
    if col in d['pks']:
        return (col + '  [PK]', PK_COLOR, 'bold')
    if col in d['fks']:
        ref = d['fks'][col]
        return (f'{col}  → {ref[0]}.{ref[1]}', FK_COLOR, 'normal')
    return (col, PLAIN, 'normal')


def box_size(t):
    n = len(schema[t]['cols'])
    h = HEAD_H + n * ROW_H + PAD * 2
    longest = max((len(c) for c, _ in schema[t]['cols']), default=0)
    w = max(4.2, 0.11 * longest + 2.2)
    return w, h


def draw_box(ax, t, cx, cy):
    w, h = box_size(t)
    x0, y0 = cx - w / 2, cy - h / 2

    outer = FancyBboxPatch((x0, y0), w, h,
                           boxstyle='round,pad=0.02,rounding_size=0.12',
                           linewidth=1.2, edgecolor=KEY_COLOR, facecolor='#f6fafd', zorder=2)
    ax.add_patch(outer)
    header = FancyBboxPatch((x0, cy + h / 2 - HEAD_H), w, HEAD_H,
                            boxstyle='round,pad=0.02,rounding_size=0.16',
                            linewidth=0, facecolor=KEY_COLOR, zorder=3)
    ax.add_patch(header)
    ax.text(cx, cy + h / 2 - HEAD_H / 2, box_label(t),
            ha='center', va='center', fontsize=FS_HEAD, fontweight='bold',
            color='white', zorder=4)

    y = cy + h / 2 - HEAD_H - ROW_H / 2 - PAD
    for col, _typ in schema[t]['cols']:
        text, color, weight = column_display(t, col)
        ax.text(x0 + PAD + 0.1, y, text, ha='left', va='center',
                fontsize=FS, color=color, fontweight=weight, zorder=5)
        y -= ROW_H
    return (cx, cy, w, h)


def exit_point(p, target):
    cx, cy, w, h = p
    tx, ty = target
    dx, dy = tx - cx, ty - cy
    if dx == 0 and dy == 0:
        return (cx, cy)
    hw, hh = w / 2, h / 2
    sx = float('inf') if dx == 0 else hw / abs(dx)
    sy = float('inf') if dy == 0 else hh / abs(dy)
    k = min(sx, sy)
    return (cx + dx * k, cy + dy * k)


def draw_edge(ax, box_a, box_b, label):
    pa = exit_point(box_a, (box_b[0], box_b[1]))
    pb = exit_point(box_b, (box_a[0], box_a[1]))
    arrow = FancyArrowPatch(pa, pb, arrowstyle='-|>', mutation_scale=13,
                            linewidth=1.1, color=EDGE_COLOR, zorder=1)
    ax.add_patch(arrow)
    if label:
        mx, my = (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2
        ax.text(mx, my + 0.15, label, fontsize=6.0, color='#374151',
                ha='center', va='bottom', zorder=6,
                bbox=dict(boxstyle='round,pad=0.15', fc='white',
                          ec='none', alpha=0.9))


# --------------------------------------------------------------------------
# 3. Page 1 - business tables (vertical chain + tenants branch)
# --------------------------------------------------------------------------
BUSINESS_ORDER = ['users', 'landlords', 'properties', 'house_units',
                  'rental_agreements', 'payments', 'payment_gateway_logs']


def render_business(ax):
    XMAIN = 12.0
    TENANT_X = 30.0
    ypos = 1.0
    boxes = {}

    # main chain, bottom -> top
    for t in ['payment_gateway_logs', 'payments', 'rental_agreements',
              'house_units', 'properties', 'landlords', 'users']:
        w, h = box_size(t)
        cy = ypos + h / 2
        boxes[t] = (XMAIN, cy, w, h)
        draw_box(ax, t, XMAIN, cy)
        ypos += h + GAP
    total_h = ypos

    # tenants sits to the right, mid-stack
    w, h = box_size('tenants')
    cy = (boxes['users'][1] + boxes['rental_agreements'][1]) / 2 - 4
    draw_box(ax, 'tenants', TENANT_X, cy)
    boxes['tenants'] = (TENANT_X, cy, w, h)

    # relationships
    draw_edge(ax, boxes['users'], boxes['landlords'], 'user_id')
    draw_edge(ax, boxes['tenants'], boxes['users'], 'user_id')
    draw_edge(ax, boxes['landlords'], boxes['properties'], 'landlord_id')
    draw_edge(ax, boxes['properties'], boxes['house_units'], 'property_id')
    draw_edge(ax, boxes['house_units'], boxes['rental_agreements'], 'unit_id')
    draw_edge(ax, boxes['tenants'], boxes['rental_agreements'], 'tenant_id')
    draw_edge(ax, boxes['rental_agreements'], boxes['payments'], 'agreement_id')
    draw_edge(ax, boxes['payments'], boxes['payment_gateway_logs'], 'payment_id')

    ax.set_xlim(-1, TENANT_X + 12)
    ax.set_ylim(0, total_h + 1)
    ax.set_axis_off()
    ax.set_title('SMRS — Business Data Model (ERD)', fontsize=13,
                 fontweight='bold', color=KEY_COLOR, pad=16)


# --------------------------------------------------------------------------
# 4. Page 2 - Django framework tables
# --------------------------------------------------------------------------
FRAMEWORK = ['django_content_type', 'auth_permission', 'auth_group',
             'auth_group_permissions', 'users_groups', 'users_user_permissions',
             'django_admin_log', 'django_session', 'django_migrations']


def render_framework(ax):
    placements = {}
    col = 0
    row = 0
    max_cols = 3
    col_x = [14.0, 32.0, 50.0]
    for i, name in enumerate(FRAMEWORK):
        placements[name] = (col_x[col], 26 - row * 9.0)
        col += 1
        if col == max_cols:
            col = 0
            row += 1
    boxes = {}
    for name in FRAMEWORK:
        cx, cy = placements[name]
        bx = draw_box(ax, name, cx, cy)
        boxes[name] = bx
    for name in FRAMEWORK:
        for colname, (reft, refc) in schema[name]['fks'].items():
            if reft in boxes and reft != name:
                draw_edge(ax, boxes[name], boxes[reft],
                          f'{colname} → {refc}')

    ax.set_xlim(0, 62)
    ax.set_ylim(0, 30)
    ax.set_axis_off()
    ax.set_title('SMRS — Django Framework Tables (ERD)', fontsize=13,
                 fontweight='bold', color='#1f5c3a', pad=16)


# --------------------------------------------------------------------------
# 5. Emit PDF
# --------------------------------------------------------------------------
from matplotlib.backends.backend_pdf import PdfPages

OUT = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database-ERD.pdf')

fig1, ax1 = plt.subplots(figsize=(13, 24))
render_business(ax1)

fig2, ax2 = plt.subplots(figsize=(14, 12))
render_framework(ax2)

with PdfPages(OUT) as pdf:
    pdf.savefig(fig1, bbox_inches='tight')
    pdf.savefig(fig2, bbox_inches='tight')
    d = pdf.infodict()
    d['Title'] = 'SMRS Database Schema ERD'
    d['Creator'] = 'SMRS'

print('Wrote', OUT)