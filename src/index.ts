'use strict';

import * as Stream from "stream";
import * as strtok3 from "strtok3";
import {Promise} from "es6-promise";
import * as path from "path";

import {GenericTagId, TagType} from './common/GenericTagTypes';
import {ITokenParser, ParserFactory} from "./ParserFactory";
import {MetadataCollector} from './common/MetadataCollector';

/**
 * Attached picture, typically used for cover art
 */
export interface IPicture {
  /**
   * Image mime type
   */
  format: string;
  /**
   * Image data
   */
  data: Buffer;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Picture type
   */
  type?: string;
}

/**
 * Abstract interface to access rating information
 */
export interface IRating {
  /**
   * Rating source, could be an e-mail address
   */
  source?: string;
  /**
   * Rating [0..1]
   */
  rating: number;
}

export interface ICommonTagsResult {
  track: { no: number, of: number };
  disk: { no: number, of: number };
  /**
   * Release year
   */
  year?: number;
  /**
   * Track title
   */
  title?: string;
  /**
   * Track, maybe several artists written in a single string.
   */
  artist?: string;
  /**
   * Track artists, aims to capture every artist in a different string.
   */
  artists?: string[];
  /**
   * Track album artists
   */
  albumartist?: string;
  /**
   * Album title
   */
  album?: string;
  /**
   * Release data
   */
  date?: string;
  /**
   * Original release date
   */
  originaldate?: string;
  /**
   * Original release yeat
   */
  originalyear?: number;
  /**
   * List of comments
   */
  comment?: string[];
  /**
   * Genre
   */
  genre?: string[];
  /**
   * Embedded album art
   */
  picture?: IPicture[];
  /**
   * Track composer
   */
  composer?: string[];
  /**
   * Lyrics
   */
  lyrics?: string[];
  /**
   * Album title, formatted for alphabetic ordering
   */
  albumsort?: string;
  /**
   * Track title, formatted for alphabetic ordering
   */
  titlesort?: string;
  /**
   * The canonical title of the work
   */
  work?: string;
  /**
   * Track artist, formatted for alphabetic ordering
   */
  artistsort?: string;
  /**
   * Album artist, formatted for alphabetic ordering
   */
  albumartistsort?: string;
  /**
   * Composer(s), formatted for alphabetic ordering
   */
  composersort?: string[];
  /**
   * Lyricist(s)
   */
  lyricist?: string[];
  /**
   * Writer(s)
   */
  writer?: string[];
  /**
   * Conductor(s)
   */
  conductor?: string[];
  /**
   * Remixer(s)
   */
  remixer?: string[];
  /**
   * Arranger(s)
   */
  arranger?: string[];
  /**
   * Engineer(s)
   */
  engineer?: string[];
  /**
   * Producer(s)
   */
  producer?: string[];
  /**
   * Mix-DJ(s)
   */
  djmixer?: string[];
  /**
   * Mixed by
   */
  mixer?: string[];
  technician?: string[];
  label?: string[];
  grouping?: string[];
  subtitle?: string[];
  discsubtitle?: string[];
  totaltracks?: string;
  totaldiscs?: string;
  compilation?: string;
  rating?: IRating[];
  bpm?: string;
  /**
   * Keywords to reflect the mood of the audio, e.g. 'Romantic' or 'Sad'
   */
  mood?: string;
  /**
   * Release format, e.g. 'CD'
   */
  media?: string;
  /**
   * Release catalog number(s)
   */
  catalognumber?: string[];
  /**
   * TV show title
   */
  tvShow?: string;
  /**
   * TV show title, formatted for alphabetic ordering
   */
  tvShowSort?: string;
  /**
   * TV season title
   */
  tvSeason?: string;
  /**
   * TV episode ID
   */
  tvEpisodeID?: string,
  /**
   * TV network
   */
  tvNetwork?: string,
  podcast?: string;
  podcasturl?: string;
  releasestatus?: string;
  releasetype?: string[];
  releasecountry?: string;
  script?: string;
  language?: string;
  copyright?: string;
  license?: string;
  encodedby?: string;
  encodersettings?: string;
  gapless?: boolean;
  barcode?: string; // ToDo: multiple??
  // International Standard Recording Code
  isrc?: string[];
  asin?: string;
  musicbrainz_recordingid?: string;
  musicbrainz_trackid?: string;
  musicbrainz_albumid?: string;
  musicbrainz_artistid?: string[];
  musicbrainz_albumartistid?: string[];
  musicbrainz_releasegroupid?: string;
  musicbrainz_workid?: string;
  musicbrainz_trmid?: string;
  musicbrainz_discid?: string;
  acoustid_id?: string;
  acoustid_fingerprint?: string;
  musicip_puid?: string;
  musicip_fingerprint?: string;
  website?: string;
  'performer:instrument'?: string[];
  averageLevel?: number;
  peakLevel?: number;
  notes?: string[];
  originalalbum?: string;
  originalartist?: string;
  // Discogs:
  discogs_artist_id?: number[];
  discogs_release_id?: number;
  discogs_label_id?: number;
  discogs_master_release_id?: number;
  discogs_votes?: number;
  discogs_rating?: number;

  /**
   * Track gain in dB; eg: "-7.03 dB"
   */
  replaygain_track_gain?: string;
  /**
   * Track peak [0..1]
   */
  replaygain_track_peak?: number;

}

export type FormatId =
  'dataformat'
  | 'duration'
  | 'bitrate'
  | 'sampleRate'
  | 'bitsPerSample'
  | 'encoder'
  | 'codecProfile'
  | 'lossless'
  | 'numberOfChannels'
  | 'numberOfSamples'
  | 'audioMD5';

export interface IFormat {

  /**
   * E.g.: 'flac'
   */
  readonly dataformat?: string, // ToDo: make mandatory

  /**
   * List of tags found in parsed audio file
   */
  readonly tagTypes?: TagType[],

  /**
   * Duration in seconds
   */
  readonly duration?: number,

  /**
   * Number bits per second of encoded audio file
   */
  readonly bitrate?: number,

  /**
   * Sampling rate in Samples per second (S/s)
   */
  readonly sampleRate?: number,

  /**
   * Audio bit depth
   */
  readonly bitsPerSample?: number,

  /**
   * Encoder name, e.g.:
   */
  readonly encoder?: string,

  /**
   * Codec profile
   */
  readonly codecProfile?: string,

  readonly lossless?: boolean,

  /**
   * Number of audio channels
   */
  readonly numberOfChannels?: number,

  /**
   * Number of samples frames.
   * One sample contains all channels
   * The duration is: numberOfSamples / sampleRate
   */
  readonly numberOfSamples?: number

  /**
   * 16-byte MD5 of raw audio
   */
  readonly audioMD5?: Buffer;
}

export interface ITag {
  id: string,
  value: any
}

/**
 * Flat list of tags
 */
export interface INativeTags {
  [tagType: string]: ITag[];
}

/**
 * Tags ordered by tag-ID
 */
export interface INativeTagDict {
  [tagId: string]: any[];
}

export interface INativeAudioMetadata {
  format: IFormat,
  native: INativeTags
}

export interface IAudioMetadata extends INativeAudioMetadata {
  common: ICommonTagsResult,
}

/**
 * Corresponds with parser module name
 */
export type ParserType = 'mpeg' | 'apev2' | 'mp4' | 'asf' | 'flac' | 'ogg' | 'aiff' | 'wavpack' | 'riff';

export interface IOptions {
  path?: string,

  /**
   *  default: `undefined`, pass the
   */
  fileSize?: number,

  /**
   *  default: `false`, if set to `true`, it will return native tags in addition to the `common` tags.
   */
  native?: boolean,

  /**
   * default: `false`, if set to `true`, it will parse the whole media file if required to determine the duration.
   */
  duration?: boolean;

  /**
   * default: `false`, if set to `true`, it will skip parsing covers.
   */
  skipCovers?: boolean;

  /**
   * default: `false`, if set to `true`, it will not search all the entire track for additional headers.
   * Only recommenced to use in combination with streams.
   */
  skipPostHeaders?: boolean;

  /**
   * Allow custom loading of modules
   * @param {string} moduleName module name
   * @return {Promise<ITokenParser>} parser
   */
  loadParser?: (moduleName: ParserType) => Promise<ITokenParser>;

  /**
   * Set observer for async callbacks to common or format.
   */
  observer?: Observer;
}

/**
 * Event definition send after each change to common/format metadata change to observer.
 */
export interface IMetadataEvent {

  /**
   * Tag which has been updated.
   */
  tag: {

    /**
     * Either 'common' if it a generic tag event, or 'format' for format related updates
     */
    type: 'common' | 'format'

    /**
     * Tag id
     */
    id: GenericTagId | FormatId

    /**
     * Tag value
     */
    value: any
  };

  /**
   * Metadata model including the attached tag
   */
  metadata: IAudioMetadata
}

export type Observer = (update: IMetadataEvent) => void;

/**
 * Parse audio from Node file
 * @param {string} filePath Media file to read meta-data from
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 */
export function parseFile(filePath: string, options: IOptions = {}): Promise<IAudioMetadata> {
  return strtok3.fromFile(filePath).then(fileTokenizer => {
    const parserName = ParserFactory.getParserIdForExtension(filePath);
    if (parserName) {
      return ParserFactory.loadParser(parserName, options).then(parser => {
        const metadata = new MetadataCollector(options);
        return parser.init(metadata, fileTokenizer, options).parse().then(() => {
          return fileTokenizer.close().then(() => {
            return metadata.toCommonMetadata();
          });
        }).catch(err => {
          return fileTokenizer.close().then(() => {
            throw err;
          });
        });
      });
    } else {
      throw new Error('No parser found for extension: ' + path.extname(filePath));
    }
  });
}

/**
 * Parse audio from Node Stream.Readable
 * @param {Stream.Readable} Stream to read the audio track from
 * @param {string} mimeType Content specification MIME-type, e.g.: 'audio/mpeg'
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 */
export function parseStream(stream: Stream.Readable, mimeType?: string, options: IOptions = {}): Promise<IAudioMetadata> {
  return strtok3.fromStream(stream).then(tokenizer => {
    if (!tokenizer.fileSize && options.fileSize) {
      tokenizer.fileSize = options.fileSize;
    }
    return ParserFactory.parse(tokenizer, mimeType, options);
  });
}

/**
 * Parse audio from Node Buffer
 * @param {Stream.Readable} stream Audio input stream
 * @param {string} mimeType <string> Content specification MIME-type, e.g.: 'audio/mpeg'
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 */
export function parseBuffer(buf: Buffer, mimeType?: string, options: IOptions = {}): Promise<IAudioMetadata> {
  const tokenizer = strtok3.fromBuffer(buf);
  if (!tokenizer.fileSize && options.fileSize) {
    tokenizer.fileSize = options.fileSize;
  }
  return ParserFactory.parse(tokenizer, mimeType, options);
}

/**
 * Create a dictionary ordered by their tag id (key)
 * @param nativeTags list of tags
 * @returns tags indexed by id
 */
export function orderTags(nativeTags: ITag[]): INativeTagDict {
  const tags = {};
  for (const tag of nativeTags) {
    (tags[tag.id] = (tags[tag.id] || [])).push(tag.value);
  }
  return tags;
}

export function joinArtists(artists: string[]): string {
  if (artists.length > 2) {
    return artists.slice(0, artists.length - 1).join(', ') + ' & ' + artists[artists.length - 1];
  }
  return artists.join(' & ');
}

/**
 * Convert rating to 1-5 star rating
 * @param {number} rating Normalized rating [0..1] (common.rating[n].rating)
 * @returns {number} Number of stars: 1, 2, 3, 4 or 5 stars
 */
export function ratingToStars(rating: number): number {
  return rating === undefined ? 0 : 1 + Math.round(rating * 4);
}
