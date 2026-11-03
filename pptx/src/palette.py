"""Token values and slide metrics shared by the template and sample-deck builders."""
import json
from pathlib import Path

HERE = Path(__file__).parent
_TOKEN_FILE = json.loads((HERE.parent / "build/tokens.json").read_text())
TOKENS = _TOKEN_FILE["colours"]
THEMES = ("light", "dark")

# Masters: light, dark with the default shadow (B, cream-rimmed slab) and dark with option D
# (own-colour extrusion). Both dark variants use the dark token values.
VARIANTS = ("light", "dark", "dark-colour")
VARIANT_NAMES = {"light": "light", "dark": "dark", "dark-colour": "dark colour shadows"}
EXTRUSIONS = {k: v.lstrip("#").upper() for k, v in _TOKEN_FILE["shadowD"]["extrusionsDark"].items()}
# Buttons whose darkened fill sits too close to the page (--extrusion: initial); checked chips too.
NOT_EXTRUDED = {"navy", "section"}


def token_theme(variant):
    return "light" if variant == "light" else "dark"


def hex_of(token, variant):
    """A token's colour as RRGGBB (no #), e.g. hex_of('teal', 'light') -> '2EA6B1'."""
    return TOKENS[f"--{token}"][token_theme(variant)].lstrip("#").upper()


def shadow_style(variant):
    """'plain' (light), 'rim' (dark, option B) or 'extrude' (dark, option D)."""
    return {"light": "plain", "dark": "rim", "dark-colour": "extrude"}[variant]


def shadow_hex(variant, fill=None, excluded=NOT_EXTRUDED):
    """The hard shadow's colour for an element filled with a token (None if unfilled). Option D
    darkens the fill; neutral fills, unfilled elements and the excluded fills get --shadow-lit."""
    if shadow_style(variant) != "extrude":
        return hex_of("line", variant)
    if fill in EXTRUSIONS and fill not in excluded:
        return EXTRUSIONS[fill]
    return hex_of("shadow-lit", variant)


def inset_hex(variant):
    """The inside (pressed-in) shadow, --shadow-inset: near-black --line in every theme."""
    return hex_of("line", variant)


def emu(pt):
    return int(round(pt * 12700))


# 1 CSS px = 0.75 pt, so a 960 x 540 pt slide is a 1280 x 720 px page.
PX = 0.75
OUTLINE_PT = 2 * PX  # --outline-width
SHADOW_PT = 4 * PX  # --shadow-offset
PRESSED_SHADOW_PT = 2 * PX  # --shadow-pressed
RADIUS_PT = 10 * PX  # --radius
SLIDE_W, SLIDE_H = 960, 540
MARGIN = 48  # --space-8 (64 px)

# Slide type scale: the site's 1.3 ratio from a 20 pt base (the site's 16 px x 1.25 for projection).
BASE_PT = 20


def step(n):
    """Type-scale step n in whole points; step -1 is fixed at 0.8 x base, as on the site."""
    return round(BASE_PT * 0.8) if n == -1 else round(BASE_PT * 1.3**n)


SERIES = ["teal", "yellow", "navy", "green", "sky", "coral", "grape", "tangerine"]


def theme_slots(theme):
    """The theme's 12 colour slots. Both masters map bg1 raised, tx1 fg, bg2 surface, tx2 navy-deep."""
    if theme == "light":
        neutrals = {"dk1": "fg", "lt1": "raised", "dk2": "navy-deep", "lt2": "surface"}
    else:
        neutrals = {"dk1": "surface", "lt1": "fg", "dk2": "raised", "lt2": "navy-deep"}
    slots = {k: hex_of(v, theme) for k, v in neutrals.items()}
    for i, hue in enumerate(SERIES[:6], start=1):
        slots[f"accent{i}"] = hex_of(hue, theme)
    slots["hlink"] = hex_of("navy-deep", theme)  # the site's link colour
    slots["folHlink"] = hex_of("grape-deep", theme)
    return slots, neutrals


CLR_MAP = {
    "light": 'bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2"',
    "dark": 'bg1="dk2" tx1="lt1" bg2="dk1" tx2="lt2"',
    "dark-colour": 'bg1="dk2" tx1="lt1" bg2="dk1" tx2="lt2"',
}

# Extra tokens offered under Custom Colors in PowerPoint's colour picker (first ten show there).
CUSTOM_COLOURS = [
    "grape", "tangerine", "lilac", "apricot", "coral-solid", "muted", "slate", "teal-deep",
    "coral-deep", "green-deep", "navy-tint", "teal-tint", "coral-tint", "yellow-tint", "green-tint",
    "sky-tint", "lilac-tint", "apricot-tint", "yellow-deep", "sky-deep", "grape-deep",
    "tangerine-deep", "on-navy", "ink", "line",
]
