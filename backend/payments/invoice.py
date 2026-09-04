"""Generate a payment invoice/receipt PDF for the House Rental system."""
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
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


def _money(value):
    return f'TZS {value:,.0f}'


def generate_payment_invoice(payment):
    """Render a one-page invoice PDF for a Payment and return a BytesIO buffer."""
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=16 * mm, bottomMargin=16 * mm,
    )

    styles = getSampleStyleSheet()
    brand = ParagraphStyle('brand', parent=styles['Normal'], fontName='Helvetica-Bold',
                           fontSize=12, textColor=BRAND_GREEN, alignment=TA_CENTER, spaceAfter=2)
    brand_sub = ParagraphStyle('brand_sub', parent=styles['Normal'], fontSize=9,
                               alignment=TA_CENTER, textColor=colors.HexColor('#888888'))
    doc_title = ParagraphStyle('doc_title', parent=styles['Title'], fontName='Helvetica-Bold',
                               fontSize=20, textColor=BRAND_BLUE, alignment=TA_CENTER,
                               spaceBefore=8, spaceAfter=14)
    label = ParagraphStyle('label', parent=styles['Normal'], fontName='Helvetica-Bold',
                           fontSize=9, textColor=colors.HexColor('#666666'))
    value = ParagraphStyle('value', parent=styles['Normal'], fontSize=10,
                           textColor=colors.HexColor('#222222'))
    amount_val = ParagraphStyle('amount_val', parent=styles['Normal'], fontName='Helvetica-Bold',
                                fontSize=13, textColor=colors.HexColor('#003333'))
    note = ParagraphStyle('note', parent=styles['Normal'], fontSize=8,
                          textColor=colors.HexColor('#999999'))

    ra = payment.rental_agreement
    tenant = ra.tenant
    unit = ra.house_unit
    prop = unit.property
    paid = payment.status.upper() == 'COMPLETED'
    doc_label = 'PAID RECEIPT' if paid else 'PAYMENT INVOICE'
    due_label = 'Paid on' if paid else 'Due date'
    due_value = payment.payment_date if paid else payment.due_date
    due_str = due_value.strftime('%d %b %Y') if due_value else '—'

    # Bill-To block (left column)
    bill_rows = []
    name = tenant.user.get_full_name() or tenant.user.email
    for txt in (name, tenant.user.email, tenant.user.phone or ''):
        bill_rows.append(Paragraph(txt, value))
    bill_block = Table(
        [[Paragraph('<b>Bill To</b>', label), Paragraph('<b>Invoice Details</b>', label)],
         [bill_rows, [
             Paragraph(f'Invoice No: INV-{payment.id}', value),
             Paragraph(f'Method: {payment.payment_method or "—"}', value),
             Paragraph(f'{due_label}: {due_str}', value),
             Paragraph(f'Status: {"PAID" if paid else payment.status}', value),
         ]],
    ], colWidths=[90 * mm, 80 * mm])
    bill_block.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))

    # Description / amount table
    details = Table([
        [Paragraph('<b>Description</b>', value), Paragraph('<b>Amount</b>', value)],
        [Paragraph(f'Rent for {prop.name} – Unit {unit.unit_number}', value),
         Paragraph(_money(payment.amount), amount_val)],
    ], colWidths=[125 * mm, 45 * mm])
    details.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EEF5FA')),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#CCCCCC')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))

    story = [
        Paragraph('HOUSE RENTAL SYSTEM', brand),
        Paragraph('Magomeni, Dar es Salaam | +255 712 345 678', brand_sub),
        HRFlowable(width='100%', thickness=1, color=BRAND_GREEN),
        Paragraph(doc_label, doc_title),
        bill_block,
        Spacer(1, 14),
        details,
        Spacer(1, 16),
        Paragraph(f'Transaction reference: {payment.transaction_reference or "—"}', value),
        Spacer(1, 24),
        HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#CCCCCC')),
        Spacer(1, 6),
        Paragraph('This is a computer-generated invoice. Thank you for paying your rent on time.', note),
    ]

    doc.build(story)
    buf.seek(0)
    return buf