#!/usr/bin/env python3
"""Generate BestInSeattle Media Kit PDF."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

OUTPUT = "/Volumes/workspace/bestinseattle/docs/BestInSeattle-MediaKit.pdf"

# Brand colors
CREAM = HexColor("#FAF8F5")
GOLD = HexColor("#B8963E")
DARK = HexColor("#1A1A1A")
MUTED = HexColor("#6B6B6B")
LIGHT_BORDER = HexColor("#E5E2DD")
SURFACE = HexColor("#F5F3EF")

W, H = letter  # 612 x 792


def draw_header_bar(c, y, text):
    """Draw a gold accent bar with section title."""
    c.setFillColor(GOLD)
    c.rect(60, y, 4, 20, fill=1, stroke=0)
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(74, y + 4, text)


def draw_card(c, x, y, w, h, title, body, icon=None):
    """Draw a rounded card with title and body text."""
    # Card background
    c.setFillColor(SURFACE)
    c.setStrokeColor(LIGHT_BORDER)
    c.setLineWidth(0.5)
    c.roundRect(x, y, w, h, 8, fill=1, stroke=1)

    # Title
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 11)
    if icon:
        c.drawString(x + 15, y + h - 25, f"{icon}  {title}")
    else:
        c.drawString(x + 15, y + h - 25, title)

    # Body text - wrap manually
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    words = body.split()
    lines = []
    current = ""
    max_w = w - 30
    for word in words:
        test = current + " " + word if current else word
        if c.stringWidth(test, "Helvetica", 9) < max_w:
            current = test
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)

    ty = y + h - 42
    for line in lines[:4]:
        c.drawString(x + 15, ty, line)
        ty -= 13


def draw_stat_box(c, x, y, w, label, value, sublabel=""):
    """Draw a stat/metric box."""
    c.setFillColor(SURFACE)
    c.setStrokeColor(LIGHT_BORDER)
    c.setLineWidth(0.5)
    c.roundRect(x, y, w, 70, 8, fill=1, stroke=1)

    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(x + w / 2, y + 40, value)

    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(x + w / 2, y + 22, label)

    if sublabel:
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 7)
        c.drawCentredString(x + w / 2, y + 10, sublabel)


def page_cover(c):
    """Page 1: Cover page."""
    # Full background
    c.setFillColor(DARK)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Gold accent stripe at top
    c.setFillColor(GOLD)
    c.rect(0, H - 6, W, 6, fill=1, stroke=0)

    # Brand name
    c.setFillColor(white)
    c.setFont("Helvetica", 16)
    c.drawString(60, H - 60, "best")
    w1 = c.stringWidth("best", "Helvetica", 16)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(60 + w1, H - 60, "InSeattle")

    # Divider line
    c.setStrokeColor(HexColor("#333333"))
    c.setLineWidth(0.5)
    c.line(60, H - 80, W - 60, H - 80)

    # Main title
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 42)
    c.drawString(60, H - 200, "Media Kit")

    # Year
    c.setFillColor(GOLD)
    c.setFont("Helvetica", 18)
    c.drawString(60, H - 235, "2026")

    # Tagline
    c.setFillColor(HexColor("#AAAAAA"))
    c.setFont("Helvetica", 14)
    c.drawString(60, H - 310, "Discover what's actually worth doing.")

    # Description block
    c.setFillColor(HexColor("#888888"))
    c.setFont("Helvetica", 11)
    lines = [
        "Premium editorial guide to Seattle + PNW",
        "events, restaurants, and local gems.",
        "",
        "Manually curated. No algorithms. No fluff.",
    ]
    y = H - 370
    for line in lines:
        c.drawString(60, y, line)
        y -= 18

    # Bottom contact bar
    c.setFillColor(HexColor("#222222"))
    c.rect(0, 0, W, 80, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("Helvetica", 9)
    c.drawString(60, 50, "bestseattle.co")
    c.setFillColor(HexColor("#888888"))
    c.drawString(60, 34, "partnerships@bestseattle.co")

    # Gold bottom accent
    c.setFillColor(GOLD)
    c.rect(0, 0, W, 3, fill=1, stroke=0)


def page_about(c):
    """Page 2: About / What We Do."""
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Gold top accent
    c.setFillColor(GOLD)
    c.rect(0, H - 3, W, 3, fill=1, stroke=0)

    draw_header_bar(c, H - 60, "ABOUT US")

    # Main description
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(60, H - 110, "Premium curation for Seattle + PNW")

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 11)
    desc_lines = [
        "BestInSeattle is a manually curated editorial guide covering the best events,",
        "restaurants, date-night spots, nightlife, outdoor activities, and neighborhood",
        "guides across Seattle and the Pacific Northwest.",
        "",
        "We help an engaged audience of urban professionals, foodies, and experience-seekers",
        "discover what's actually worth doing — tonight, this weekend, and beyond.",
    ]
    y = H - 145
    for line in desc_lines:
        c.drawString(60, y, line)
        y -= 16

    # What sets us apart section
    draw_header_bar(c, H - 290, "WHAT SETS US APART")

    cards = [
        ("Manual Curation", "Every recommendation is hand-picked by our editorial team. No algorithms, no pay-to-play listings, no fluff."),
        ("High-Intent Audience", "Readers come to us to make a decision: where to eat tonight, what to do this weekend, which gems are worth their time."),
        ("Local Authority", "Deep neighborhood expertise across Capitol Hill, Ballard, Fremont, Downtown, West Seattle, and the broader PNW."),
        ("Multi-Format", "Website, weekly newsletter, and social channels — reaching your audience wherever they discover."),
    ]

    y = H - 330
    for i, (title, body) in enumerate(cards):
        col = i % 2
        row = i // 2
        cx = 60 + col * 250
        cy = y - row * 100
        draw_card(c, cx, cy, 236, 88, title, body)

    # Content pillars
    draw_header_bar(c, H - 550, "CONTENT PILLARS")

    pillars = [
        ("Events", "Concerts, festivals, shows, markets"),
        ("Eat + Drink", "Restaurants, bars, coffee, bakeries"),
        ("Date Night", "Curated romantic experiences by zone"),
        ("Nightlife", "Late-night spots, bars, live music"),
        ("Outdoors", "Hikes, parks, water activities"),
        ("Family", "Kid-friendly picks, all weather safe"),
    ]

    y = H - 590
    for i, (title, desc) in enumerate(pillars):
        col = i % 3
        row = i // 3
        cx = 60 + col * 168
        cy = y - row * 55

        c.setFillColor(SURFACE)
        c.setStrokeColor(LIGHT_BORDER)
        c.roundRect(cx, cy, 156, 45, 6, fill=1, stroke=1)

        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(cx + 12, cy + 25, title)

        c.setFillColor(MUTED)
        c.setFont("Helvetica", 8)
        c.drawString(cx + 12, cy + 10, desc)

    # Footer
    c.setFillColor(LIGHT_BORDER)
    c.line(60, 40, W - 60, 40)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(60, 25, "BestInSeattle Media Kit 2026")
    c.drawRightString(W - 60, 25, "Page 2")


def page_audience(c):
    """Page 3: Audience."""
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    c.setFillColor(GOLD)
    c.rect(0, H - 3, W, 3, fill=1, stroke=0)

    draw_header_bar(c, H - 60, "AUDIENCE")

    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(60, H - 110, "Who reads BestInSeattle")

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 11)
    c.drawString(60, H - 135, "Urban professionals and experience-seekers in the Seattle metro area.")

    # Audience stats (launching phase — positioned as growth)
    draw_header_bar(c, H - 180, "AUDIENCE PROFILE")

    stats = [
        ("25-44", "Core Age Range", "Urban professionals"),
        ("Seattle Metro", "Geography", "Seattle, Eastside, PNW"),
        ("High Intent", "Reader Behavior", "Decision-making visits"),
        ("Multi-Channel", "Distribution", "Web + Newsletter + Social"),
    ]

    for i, (val, label, sub) in enumerate(stats):
        x = 60 + i * 126
        draw_stat_box(c, x, H - 275, 118, label, val, sub)

    # Demographics breakdown
    draw_header_bar(c, H - 330, "DEMOGRAPHICS")

    demo_items = [
        ("Interests", "Dining out, live events, weekend plans, local discovery, travel, cocktails, coffee culture"),
        ("Lifestyle", "Active social calendars, values quality over quantity, supports local businesses"),
        ("Income", "Above-average household income, discretionary spending on dining and entertainment"),
        ("Behavior", "Plans weekends in advance, shares recommendations with friends, trusts editorial picks over crowd-sourced reviews"),
    ]

    y = H - 370
    for title, desc in demo_items:
        c.setFillColor(SURFACE)
        c.setStrokeColor(LIGHT_BORDER)
        c.roundRect(60, y, W - 120, 50, 6, fill=1, stroke=1)

        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(75, y + 30, title)

        c.setFillColor(MUTED)
        c.setFont("Helvetica", 9)
        # Wrap text
        words = desc.split()
        line = ""
        lx = y + 14
        for word in words:
            test = line + " " + word if line else word
            if c.stringWidth(test, "Helvetica", 9) < W - 165:
                line = test
            else:
                c.drawString(75, lx, line)
                lx -= 12
                line = word
        if line:
            c.drawString(75, lx, line)

        y -= 60

    # Coverage zones
    draw_header_bar(c, H - 590, "COVERAGE ZONES")

    zones = [
        "Capitol Hill / Central District",
        "Downtown / Belltown / SLU",
        "Ballard / Fremont / Wallingford",
        "Queen Anne / Magnolia",
        "West Seattle / White Center",
        "University District / Ravenna",
        "Columbia City / Beacon Hill",
        "Bellevue / Redmond / Kirkland",
        "Tacoma / Olympia",
    ]

    y = H - 620
    for i, zone in enumerate(zones):
        col = i % 3
        row = i // 3
        cx = 60 + col * 168
        cy = y - row * 28

        c.setFillColor(DARK)
        c.setFont("Helvetica", 9)
        c.drawString(cx + 8, cy + 8, f"  {zone}")

        # Gold bullet
        c.setFillColor(GOLD)
        c.circle(cx + 8, cy + 12, 3, fill=1, stroke=0)

    # Footer
    c.setFillColor(LIGHT_BORDER)
    c.line(60, 40, W - 60, 40)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(60, 25, "BestInSeattle Media Kit 2026")
    c.drawRightString(W - 60, 25, "Page 3")


def page_partnerships(c):
    """Page 4: Partnership Opportunities."""
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    c.setFillColor(GOLD)
    c.rect(0, H - 3, W, 3, fill=1, stroke=0)

    draw_header_bar(c, H - 60, "PARTNERSHIP OPPORTUNITIES")

    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(60, H - 110, "Ways to work together")

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 11)
    c.drawString(60, H - 135, "Flexible partnership formats designed to reach Seattle's most engaged audience.")

    # Partnership cards
    partnerships = [
        (
            "Sponsored Picks",
            "Featured placement in our curated editorial picks. Your restaurant, venue, or experience highlighted to our audience with authentic editorial voice. Clearly labeled as sponsored — our readers trust us because we're transparent.",
            "Premium visibility"
        ),
        (
            "Newsletter Sponsorship",
            "Dedicated or shared sponsorship in our weekly newsletter. Reach subscribers who actively chose to hear from us — high open rates, high engagement, zero noise.",
            "Direct to inbox"
        ),
        (
            "Zone / Neighborhood Sponsorship",
            "Own a neighborhood. Become the presenting sponsor for a Seattle zone (Capitol Hill, Ballard, Downtown, etc.) across all our content covering that area.",
            "Hyper-local targeting"
        ),
        (
            "Affiliate Partnerships",
            "Performance-based partnerships for ticket sales, reservations, and bookings. We drive high-intent traffic — readers who are ready to buy, book, or reserve.",
            "Pay for performance"
        ),
        (
            "Custom Editorial Content",
            "Branded guides, seasonal features, and custom content that matches our editorial standards. We create content that serves your brand while genuinely helping our readers.",
            "Authentic storytelling"
        ),
    ]

    y = H - 175
    for title, desc, badge in partnerships:
        h = 85
        c.setFillColor(white)
        c.setStrokeColor(LIGHT_BORDER)
        c.setLineWidth(0.5)
        c.roundRect(60, y, W - 120, h, 8, fill=1, stroke=1)

        # Gold left accent
        c.setFillColor(GOLD)
        c.roundRect(60, y, 4, h, 2, fill=1, stroke=0)

        # Badge
        badge_w = c.stringWidth(badge, "Helvetica", 7) + 16
        c.setFillColor(GOLD)
        c.roundRect(W - 60 - badge_w - 10, y + h - 28, badge_w, 18, 9, fill=1, stroke=0)
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(W - 60 - badge_w / 2 - 10, y + h - 24, badge.upper())

        # Title
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 13)
        c.drawString(78, y + h - 25, title)

        # Description
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 9)
        words = desc.split()
        line = ""
        ly = y + h - 42
        for word in words:
            test = line + " " + word if line else word
            if c.stringWidth(test, "Helvetica", 9) < W - 170:
                line = test
            else:
                c.drawString(78, ly, line)
                ly -= 13
                line = word
        if line:
            c.drawString(78, ly, line)

        y -= 95

    # Ideal partners section
    draw_header_bar(c, y + 5, "IDEAL PARTNERS")

    partners = [
        "Restaurants & bars",
        "Event venues & promoters",
        "Hotels & hospitality",
        "Tourism boards",
        "Food & beverage brands",
        "Lifestyle & wellness brands",
        "Ticket platforms",
        "Local retail & shops",
    ]

    py = y - 30
    for i, partner in enumerate(partners):
        col = i % 2
        row = i // 2
        px = 74 + col * 250
        ppy = py - row * 20

        c.setFillColor(GOLD)
        c.setFont("Helvetica", 9)
        c.drawString(px, ppy, "+")
        c.setFillColor(DARK)
        c.setFont("Helvetica", 10)
        c.drawString(px + 14, ppy, partner)

    # Footer
    c.setFillColor(LIGHT_BORDER)
    c.line(60, 40, W - 60, 40)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(60, 25, "BestInSeattle Media Kit 2026")
    c.drawRightString(W - 60, 25, "Page 4")


def page_contact(c):
    """Page 5: Contact / CTA."""
    # Dark background
    c.setFillColor(DARK)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Gold accent
    c.setFillColor(GOLD)
    c.rect(0, H - 6, W, 6, fill=1, stroke=0)

    # Brand
    c.setFillColor(white)
    c.setFont("Helvetica", 14)
    c.drawString(60, H - 60, "best")
    w1 = c.stringWidth("best", "Helvetica", 14)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(60 + w1, H - 60, "InSeattle")

    # Main CTA
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 36)
    c.drawString(60, H - 250, "Let's work")
    c.drawString(60, H - 295, "together.")

    # Gold underline
    c.setFillColor(GOLD)
    c.rect(60, H - 310, 120, 3, fill=1, stroke=0)

    c.setFillColor(HexColor("#AAAAAA"))
    c.setFont("Helvetica", 12)
    lines = [
        "We're always looking for brand partners who align",
        "with our mission: helping people discover what's",
        "actually worth doing in Seattle and the PNW.",
    ]
    y = H - 350
    for line in lines:
        c.drawString(60, y, line)
        y -= 20

    # Contact details
    y = H - 440
    contacts = [
        ("WEB", "bestseattle.co"),
        ("EMAIL", "partnerships@bestseattle.co"),
        ("SOCIAL", "@bestseattle"),
    ]

    for label, value in contacts:
        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(60, y, label)

        c.setFillColor(white)
        c.setFont("Helvetica", 12)
        c.drawString(140, y, value)

        y -= 30

    # Bottom accent
    c.setFillColor(GOLD)
    c.rect(0, 0, W, 3, fill=1, stroke=0)

    # Footer
    c.setFillColor(HexColor("#444444"))
    c.setFont("Helvetica", 8)
    c.drawCentredString(W / 2, 15, "BestInSeattle Media Kit 2026  |  bestseattle.co")


def main():
    c = canvas.Canvas(OUTPUT, pagesize=letter)
    c.setTitle("BestInSeattle Media Kit 2026")
    c.setAuthor("BestInSeattle")
    c.setSubject("Partnership & Advertising Information")

    page_cover(c)
    c.showPage()

    page_about(c)
    c.showPage()

    page_audience(c)
    c.showPage()

    page_partnerships(c)
    c.showPage()

    page_contact(c)
    c.showPage()

    c.save()
    print(f"Media kit saved to {OUTPUT}")


if __name__ == "__main__":
    main()
