
export interface MoxfieldDeck {
  id: string
  name: string
  description: string
  format: Format
  visibility: string
  publicUrl: string
  publicId: string
  likeCount: number
  viewCount: number
  commentCount: number
  sfwCommentCount: number
  bookmarkCount: number
  areCommentsEnabled: boolean
  isShared: boolean
  authorsCanEdit: boolean
  createdByUser: CreatedByUser
  authors: CreatedByUser[]
  requestedAuthors: any[]
  main: Main
  boards: Boards
}

export interface CreatedByUser {
  userName: string
  displayName: string
  profileImageUrl: string
  badges: string[]
}

interface Board {
  count: number
  cards: { [key: string]: CardEntry }
}

type BoardType =
  | 'mainboard'
  | 'sideboard'
  | 'maybeboard'
  | 'commanders'
  | 'companions'
  | 'signatureSpells'
  | 'attractions'
  | 'stickers'
  | 'planes'
  | 'schemes'

export interface Boards extends Record<BoardType, Board> {
  version: number
  tokens: Token[]
  tokensToCards: CardMappings
  cardsToTokens: CardMappings
  tokenMappings: CardMappings
  hubs: Hub[]
  createdAtUtc: string
  lastUpdatedAtUtc: string
  exportId: string
  authorTags: AuthorTags
  originalDeck?: OriginalDeck
  isTooBeaucoup: boolean
  affiliates: Affiliates
  mainCardIdIsBackFace: boolean
  allowPrimerClone: boolean
  enableMultiplePrintings: boolean
  includeBasicLandsInPrice: boolean
  includeCommandersInPrice: boolean
  includeSignatureSpellsInPrice: boolean
  colors: Color[]
  colorPercentages: ColorPercentages
  colorIdentity: Color[]
  colorIdentityPercentages: ColorPercentages
  media: Media[]
  ownerUserId: string
  autoBracket: number
  bracket: number
  ignoreBrackets: boolean
}

export interface Affiliates {
  ck: string
  tcg: string
  csi: string
  ch: string
  cm: string
  scg: string
  ct: string
}

export interface AuthorTags {
  author: string
}

export interface Hub {
  name: string
  id: string
}

export interface Media {
  type: string
  url: string
}

export enum Color {
  W = 'W',
  U = 'U',
  B = 'B',
  R = 'R',
  G = 'G',
  C = 'Colorless',
  WUBRG = 'WUBRG',
}

export interface ColorPercentages {
  white: number
  blue: number
  black: number
  red: number
  green: number
}

export interface CardEntry {
  quantity: number
  boardType: string
  finish: string
  isFoil: boolean
  isAlter: boolean
  isProxy: boolean
  card: Card
  useCmcOverride?: boolean
  useManaCostOverride?: boolean
  useColorIdentityOverride?: boolean
  excludedFromColor?: boolean
}

export interface Card {
  id: string
  uniqueCardId: string
  scryfall_id: string
  set: string
  set_name: string
  name: string
  cn: string
  layout: string
  cmc: number
  type: string
  type_line: string
  oracle_text: string
  mana_cost: string
  colors: Color[]
  color_identity: Color[]
  legalities: Legalities
  frame: string
  reserved: boolean
  digital: boolean
  foil: boolean
  nonfoil: boolean
  etched: boolean
  glossy: boolean
  rarity: string
  border_color: string
  colorshifted: boolean
  lang: string
  latest: boolean
  has_multiple_editions: boolean
  has_arena_legal: boolean
  prices: Prices
  card_faces?: CardFace[]
  artist?: string
  promo_types?: string[]
  isArenaLegal: boolean
  appeal?: number
}

export interface CardFace {
  name: string
  mana_cost: string
  type_line: string
  oracle_text: string
  colors: Color[]
  artist?: string
  image_url?: string
}

export interface Legalities {
  standard: string
  future: string
  historic: string
  gladiator: string
  pioneer: string
  explorer: string
  modern: string
  legacy: string
  pauper: string
  vintage: string
  penny: string
  commander: string
  oathbreaker: string
  brawl: string
  historicbrawl: string
  alchemy: string
  paupercommander: string
  duel: string
  oldschool: string
  premodern: string
  predh: string
}

export interface Prices {
  usd: string | null
  usd_foil: string | null
  usd_etched: string | null
  eur: string | null
  eur_foil: string | null
  tix: string | null
}

export interface Main {
  name: string
  description: string
  format: Format
}

export enum Format {
  Commander = 'commander',
  Standard = 'standard',
  Modern = 'modern',
  Legacy = 'legacy',
  Vintage = 'vintage',
  Pauper = 'pauper',
}

export interface OriginalDeck {
  publicId: string
  name: string
}

export interface Token {
  id: string
  name: string
  set: string
  cn: string
  uniqueCardId: string
  layout: string
}

export interface CardMappings {
  [key: string]: string[]
}

export interface DeckStats {
  totalCards: number
  averageCMC: number
  colorBreakdown: ColorPercentages
  typeBreakdown: {
    creatures: number
    instants: number
    sorceries: number
    artifacts: number
    enchantments: number
    planeswalkers: number
    lands: number
    battles: number
    tribal: number
  }
  manaCurve: { [cmc: number]: number }
}

export interface MoxfieldSyncParams {
  bookmarkId?: string
  fetchCards?: boolean
  pageSize?: number
  maxDecks?: number | null
}

export interface MoxfieldSyncResponse {
  success: boolean
  message?: string
  totalDecks?: number
  insertedCount?: number
  cardsFetched?: number
  decksFetchedCount?: number
  bookmarkId?: string
  durationMs?: number
  error?: string
}

export interface SyncStatus {
  isLoading: boolean
  error: string | null
  result: MoxfieldSyncResponse | null
  startTime?: Date
  endTime?: Date
}

export interface RawMoxData {
    id:                       string;
    name:                     string;
    colors:                   string[];
    format:                   string;
    authors:                  CreatedByUser[];
    bracket:                  number;
    isLegal:                  boolean;
    hubNames:                 any[];
    isShared:                 boolean;
    publicID:                 string;
    hasPrimer:                boolean;
    likeCount:                number;
    publicURL:                string;
    viewCount:                number;
    commanders:               Commander[];
    mainCardID:               string;
    visibility:               string;
    autoBracket:              number;
    commentCount:             number;
    createdAtUTC:             Date;
    bookmarkCount:            number;
    colorIdentity:            string[];
    createdByUser:            CreatedByUser;
    authorsCanEdit:           boolean;
    ignoreBrackets:           boolean;
    mainboardCount:           number;
    sideboardCount:           number;
    maybeboardCount:          number;
    sfwCommentCount:          number;
    colorPercentages:         ColorPercentages;
    lastUpdatedAtUTC:         Date;
    areCommentsEnabled:       boolean;
    mainCardIDIsBackFace:     boolean;
    mainCardIDIsCardFace:     boolean;
    colorIdentityPercentages: ColorPercentages;
}

export interface Commander {
    id:                    string;
    name:                  string;
    imageCardID:           string;
    uniqueCardID:          string;
    imageCardIDIsCardFace: boolean;
}
