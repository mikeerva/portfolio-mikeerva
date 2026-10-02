/** The brand mark: two interlocking forms. Sized by `className`, coloured by `currentColor`. */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="135 150 1315 755" className={`w-auto text-cream ${className}`} fill="currentColor" aria-hidden>
      <path d="M 140 190 C 140 165, 160 156, 190 157 C 290 160, 360 230, 430 330 C 500 430, 540 500, 600 530 C 650 555, 700 552, 760 545 C 790 542, 805 560, 790 585 C 740 670, 580 810, 470 860 C 320 925, 175 860, 145 700 C 140 680, 140 660, 140 640 Z" />
      <path d="M 1445 820 C 1445 870, 1380 900, 1320 898 C 1200 895, 1130 840, 1060 740 C 990 640, 950 560, 880 545 C 840 535, 810 540, 795 543 C 770 545, 760 525, 780 495 C 840 400, 1050 200, 1230 183 C 1360 172, 1440 260, 1445 400 Z" />
    </svg>
  )
}
