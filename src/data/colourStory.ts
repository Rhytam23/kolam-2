/*
 * Why each art form's page is coloured as it is. Every scheme comes from two things only: the art form's
 * own documented materials and ground (see traditions.ts), and one widely known colour tradition of its own
 * region (a textile, a painting style, a festival or a city). The hex values live in each art form's theme;
 * the names and reasons are here, and are shown on the About page. Colours mean different things in
 * different communities, so they are used here as materials and identity, not as claims of meaning.
 * People of each region should review these.
 */

export interface ColourStory {
  /** What the page is meant to look like. */
  looks: string;
  /** Names of the four main colours, in the order ground, text, accent, action. */
  names: [string, string, string, string];
  reason: string;
}

export const COLOUR_STORY: Record<string, ColourStory> = {
  kolam: {
    looks: 'The sky before dawn', names: ['Indigo night', 'Rice white', 'Sunrise saffron', 'Kaavi red'],
    reason: 'A kolam is drawn before sunrise on a swept threshold, so the page is the dark sky with a saffron glow at the horizon. The red-and-white stripe is the classic temple-wall paint of the south.',
  },
  muggulu: {
    looks: 'A harvest field', names: ['Olive earth', 'Powder white', 'Pumpkin-flower yellow', 'Sankranti pink'],
    reason: 'Muggulu are drawn on ground washed with water or cow dung, and are largest at Sankranti, the harvest festival, when gobbemmalu are set with flowers and bright colours are added.',
  },
  rangoli: {
    looks: 'Diwali gulal on a clean courtyard', names: ['Festival pink', 'Plum ink', 'Gulal magenta', 'Peacock teal'],
    reason: 'Rangoli is made with coloured powders, above all at Diwali, and the peacock is one of its main motifs. The page is light, like a freshly cleaned courtyard.',
  },
  alpana: {
    looks: 'The red-bordered white sari', names: ['Rice-paste white', 'Maroon-black', 'Sindoor red', 'Sindoor red'],
    reason: 'In Bengal the festival dress is the white sari with a red border, worn at Durga Puja. Alpana is white rice paste, and alta red is in its palette, so the page is white with red border bands.',
  },
  pookalam: {
    looks: 'Onam kasavu on banana leaf', names: ['Banana-leaf green', 'Kasavu cream', 'Kasavu gold', 'Leaf green'],
    reason: 'At Onam the traditional dress is cream with a gold (kasavu) border, and a pookalam is laid from fresh petals and leaves.',
  },
  mandana: {
    looks: 'A terracotta wall and the blue of Jodhpur', names: ['Geru terracotta', 'Khadiya white', 'Turban ochre', 'Jodhpur blue'],
    reason: 'Mandana is drawn in white khadiya chalk on a wall or floor coated with red ochre and cow dung. The blue is that of Jodhpur\'s old houses and the ochre that of Marwari turbans.',
  },
  aipan: {
    looks: 'Himalayan snow and geru', names: ['Snow white', 'Slate ink', 'Pichhora saffron', 'Geru red'],
    reason: 'Aipan is white rice paste on red ochre (geru). The hills of Kumaon are snow and deodar, and the bridal pichhora of Kumaon is saffron with red.',
  },
  aripan: {
    looks: 'Madhubani paper', names: ['Handmade-paper cream', 'Soot brown-black', 'Madhubani red', 'Indigo'],
    reason: 'Mithila is known for Madhubani painting, in natural red, yellow, green, indigo and soot-black on cream paper. Aripan is rice paste on the floor with touches of vermilion and turmeric.',
  },
  'jhoti-chita': {
    looks: 'A pattachitra painting', names: ['Lamp black', 'Conch white', 'Haritala yellow', 'Hingula red'],
    reason: 'Odisha\'s pattachitra paintings use conch-shell white, hingula red, haritala yellow and lamp-black. Jhoti chita is white rice paste on dark mud floors and walls.',
  },
  'chowk-purana': {
    looks: 'Banarasi brocade', names: ['Wine purple', 'Cream', 'Zari gold', 'Brocade plum'],
    reason: 'A chowk is filled with flour, turmeric and kumkum at weddings and pujas. Banaras is known for rich-coloured brocade woven with gold zari.',
  },
  chittara: {
    looks: 'Arishina and kumkuma', names: ['Turmeric yellow', 'Dark brown-black', 'Kumkum red', 'Kumkum red'],
    reason: 'Chittara is white rice paste with yellow and black natural colours on red-earth walls. In Karnataka, yellow and red are arishina (turmeric) and kumkuma, the colours of the threshold.',
  },
};
