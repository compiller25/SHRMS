"""Generate a landlord payment report PDF for the House Rental system."""
from io import BytesIO

from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BRAND_BLUE = colors.HexColor('#003152')
BRAND_GREEN = colors.HexColor('#99CC33')
GRAY = colors.HexColor('#888888')
LIGHT_BG = colors.HexColor('#F4F8FB')
STATUS_COLORS = {
    'COMPLETED': colors.HexColor('#1F7A33'),
    'PENDING': colors.HexColor('#B8860B'),
    'OVERDUE': colors.HexColor('#B22222'),
    'FAILED': colors.HexColor('#555555'),
}


def _money(value):
    return f'{value:,.0f}'


def generate_payment_report(payments, landlord):
    """Render a landscape report of payments and return a BytesIO buffer."""
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=landscape(A4),
        leftMargin=14 * mm, rightMargin=14 * mm,
        topMargin=14 * mm, bottomMargin=14 * mm,
        title='Payment Report',
    )

    styles = getSampleStyleSheet()
    brand = ParagraphStyle('brand', parent=styles['Normal'], fontName='Helvetica-Bold',
                           fontSize=13, textColor=BRAND_GREEN)
    title = ParagraphStyle('title', parent=styles['Title'], fontName='Helvetica-Bold',
                           fontSize=18, textColor=BRAND_BLUE, spaceBefore=4, spaceAfter=2)
    sub = ParagraphStyle('sub', parent=styles['Normal'], fontSize=9, textColor=GRAY)
    header = ParagraphStyle('header', parent=styles['Normal'], fontName='Helvetica-Bold',
                            fontSize=8, textColor=colors.white, backColor=BRAND_BLUE)
    cell = ParagraphStyle('cell', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#222222'))
    cell_bold = ParagraphStyle('cell_bold', parent=cell, fontName='Helvetica-Bold')
    stat_hdr = ParagraphStyle('stat_hdr', parent=header, fontSize=9)
    stat_val = ParagraphStyle('stat_val', parent=cell_bold, fontSize=11)
    stat_note = ParagraphStyle('stat_note', parent=styles['Normal'], fontSize=7, textColor=GRAY)

    landlord_name = landlord.get_full_name() or landlord.username or landlord.email
    now = timezone.now()
    now_str = now.strftime('%d %b %Y, %H:%M')

    # ---- summary card ----
    counts = {s: sum(1 for p in payments if p.status == s) for s in
              ('COMPLETED', 'PENDING', 'OVERDUE', 'FAILED')}
    amounts = {s: sum(p.amount for p in payments if p.status == s) for s in
               ('COMPLETED', 'PENDING', 'OVERDUE')}

    stat_card = [
        [Paragraph('Total Payments', stat_hdr), Paragraph('Collected', stat_hdr),
         Paragraph('Pending', stat_hdr), Paragraph('Overdue', stat_hdr),
         Paragraph('Failed', stat_hdr)],
        [Paragraph(str(len(payments)), stat_val),
         Paragraph(str(counts['COMPLETED']), stat_val),
         Paragraph(str(counts['PENDING']), stat_val),
         Paragraph(str(counts['OVERDUE']), stat_val),
         Paragraph(str(counts['FAILED']), stat_val)],
        [Paragraph('(all statuses)', stat_note),
         Paragraph(f'TZS {_money(amounts["COMPLETED"])}', stat_note),
         Paragraph(f'TZS {_money(amounts["PENDING"])}', stat_note),
         Paragraph(f'TZS {_money(amounts["OVERDUE"])}', stat_note),
         Paragraph('', stat_note)],
    ]
    stat_tbl = Table(stat_card, colWidths=[59 * mm] * 5)
    stat_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_BLUE),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#CCCCCC')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))

    # ---- payments table ----
    head = [Paragraph('ID', header), Paragraph('Tenant', header),
            Paragraph('Property / Unit', header), Paragraph('Amount (TZS)', header),
            Paragraph('Due date', header), Paragraph('Paid on', header),
            Paragraph('Method', header), Paragraph('Status', header),
            Paragraph('Reference', header)]
    body = [head]

    for p in payments:
        tenant = p.rental_agreement.tenant
        tname = tenant.user.get_full_name() or tenant.user.email
        temail = tenant.user.email or ''
        unit = p.rental_agreement.house_unit
        prop_str = f'{unit.property.name}<br/>{unit.unit_number}' if unit else '—'
        st = (p.status or '').upper()
        st_para = ParagraphStyle('st', parent=cell, fontName='Helvetica-Bold',
                                 textColor=STATUS_COLORS.get(st, colors.HexColor('#333333')))
        ref = p.transaction_reference or p.gateway_transaction_id or '—'
        body.append([
            Paragraph(str(p.id), cell),
            Paragraph(f'{tname}<br/><font size="7" color="#888888">{temail or "&nbsp;"}</font>', cell),
            Paragraph(prop_str, cell),
            Paragraph(_money(p.amount), cell_bold),
            Paragraph(p.due_date.strftime('%Y-%m-%d'), cell),
            Paragraph(p.payment_date.strftime('%Y-%m-%d') if p.payment_date else '—', cell),
            Paragraph((p.payment_method or '—').replace('_', ' '), cell),
            Paragraph(st, st_para),
            Paragraph(ref, cell),
        ])

    pay_tbl = Table(body, repeatRows=1, colWidths=[17 * mm, 55 * mm, 45 * mm, 22 * mm,
                                                   21 * mm, 21 * mm, 24 * mm, 21 * mm, 54 * mm])
    pay_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_BLUE),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#CCCCCC')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))

    story = [
        Paragraph('HOUSE RENTAL SYSTEM', brand),
        Paragraph('Magomeni, Dar es Salaam | +255 712 345 678', sub),
        HRFlowable(width='100%', thickness=1, color=BRAND_GREEN),
        Paragraph('PAYMENT REPORT', title),
        Paragraph(f'Generated on {now_str} for {landlord_name}. '
                  'All payments recorded in the system for your properties.', sub),
        Spacer(1, 8),
        stat_tbl,
        Spacer(1, 12),
        Paragraph('Payment details', cell_bold),
        Spacer(1, 4),
        pay_tbl,
        Spacer(1, 14),
        HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#CCCCCC')),
        Spacer(1, 5),
        Paragraph('This report is generated by the House Rental system.', stat_note),
    ]

    doc.build(story)
    buf.seek(0)
    return buf