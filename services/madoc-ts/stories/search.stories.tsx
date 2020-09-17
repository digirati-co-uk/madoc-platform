import { MemoryRouter } from 'react-router-dom';
import { Header } from '../src/frontend/shared/components/Header';
import { SearchFacets } from '../src/frontend/shared/components/SearchFacets';
import { SearchResults } from '../src/frontend/shared/components/SearchResults';
import { PaginationNumbered } from '../src/frontend/shared/components/Pagination';

import * as React from 'react';
import { text, number } from '@storybook/addon-knobs';
import { WidePage } from '../src/frontend/shared/atoms/WidePage';
import styled from 'styled-components';

export default { title: 'Search' };

const dummyResults = {
  pagination: {
    page: 2,
    totalPages: 9,
    totalResults: 213,
  },
  results: [
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000001006/',
      resource_id: 'urn:madoc:manifest:0000001006',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000001006/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000001006/manifest.json',
      label: {
        en: [
          'Rector Universitatis Lipsiensis ad Solemnia Funeralia Domino Marco Manckeschio, Corona Transylvano, S. Theologiae Studioso eruditione ac moribus eximio, hora I. pomeridiana, hodierno die X. Novembr. Anni M DC XCII. exsolvenda, Proceres Ac Cives Academicos invitat',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000001006/',
          id: 'urn:madoc:manifest:0000001006',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Universitatis Lipsiensis ad Solemnia Funeralia Domino Marco Manckeschio, Corona Transylvano, S. Theologiae Studioso eruditione ac moribus eximio, hora I. pomeridiana, hodierno die X. Novembr. Anni M DC XCII. exsolvenda, Proceres Ac Cives Academicos invitat",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Universitatis Lipsiensis ad Solemnia Funeralia Domino Marco Manckeschio, Corona Transylvano, S. Theologiae Studioso eruditione ac moribus eximio, hora I. pomeridiana, hodierno die X. Novembr. Anni M DC XCII. exsolvenda, Proceres Ac Cives Academicos invitat'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000008797/',
      resource_id: 'urn:madoc:manifest:0000008797',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000008797/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000008797/manifest.json',
      label: {
        en: [
          'Id, ... maxumo cum damno Rerum fuarum, Gorlicium, in Gymnasii Gorlicensis Acroatorio Majori, inter lacrymas pariterq[ue] & gratias inter ac preces, Oratione publica memorandum, H. E. Orationem de ingenti vehementissimoq[ue] Incendio, qvod Anno prædicto prædictaqve & Die ac Hora Gorlicio contigit meliorem Urbis partem una cum splendidissima D. Petri & Pauli Æde celeriter absumens, à se In Memoriam Rei, Anno M DC XCII. Die XIX. Martii, ... triplici adhibitô Argumentô habendam, publicat, Bonosqve ac Doctos omnes ad benevolè audiendum, observantuer, officiosè, humaniter invitat Christianus Funccius, Rector',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000008797/',
          id: 'urn:madoc:manifest:0000008797',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            'XCII. Die XIX. Martii, ... triplici adhibitô Argumentô habendam, publicat, Bonosqve ac Doctos omnes ad benevolè audiendum, observantuer, officiosè, humaniter invitat Christianus Funccius, <b>Rector</b>',
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Id, ... maxumo cum damno Rerum fuarum, Gorlicium, in Gymnasii Gorlicensis Acroatorio Majori, inter lacrymas pariterq[ue] & gratias inter ac preces, Oratione publica memorandum, H. E. Orationem de ingenti vehementissimoq[ue] Incendio, qvod Anno prædicto prædictaqve & Die ac Hora Gorlicio contigit meliorem Urbis partem una cum splendidissima D. Petri & Pauli Æde celeriter absumens, à se In Memoriam Rei, Anno M DC XCII. Die XIX. Martii, ... triplici adhibitô Argumentô habendam, publicat, Bonosqve ac Doctos omnes ad benevolè audiendum, observantuer, officiosè, humaniter invitat Christianus Funccius, Rector'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000544/',
      resource_id: 'urn:madoc:manifest:0000000544',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000544/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000544/manifest.json',
      label: {
        en: [
          'Filii dei hominis ex homine nati, natalitia, typis jam olim adumbrata ... Rector Academiae Lipsiensis indicit proceribus ejusdem ac civibus universis',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000544/',
          id: 'urn:madoc:manifest:0000000544',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': 'Filii dei hominis ex homine nati, natalitia, typis jam olim adumbrata ... <b>Rector</b> Academiae Lipsiensis indicit proceribus ejusdem ac civibus universis",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Filii dei hominis ex homine nati, natalitia, typis jam olim adumbrata ... Rector Academiae Lipsiensis indicit proceribus ejusdem ac civibus universis'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000706/',
      resource_id: 'urn:madoc:manifest:0000000706',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000706/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000706/manifest.json',
      label: {
        en: [
          'Rector Academiae Lipsiensis Ad Auctum Exeqvialem, Qvo Virgo ... Anna Dorothea Viri ... Valentini Alberti, SS. Theol. D. & PP. extraordinarii, ... Filia Desideratissima post horam III. solenniter efferetur, decenter prolixeqve concelebrandum Proceres Civesqve Academicos peramanter invitat',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000706/',
          id: 'urn:madoc:manifest:0000000706',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsiensis Ad Auctum Exeqvialem, Qvo Virgo ... Anna Dorothea Viri ... Valentini Alberti, SS. Theol. D. & PP. extraordinarii, ... Filia Desideratissima post horam III. solenniter efferetur, decenter prolixeqve concelebrandum Proceres Civesqve Academicos peramanter invitat",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsiensis Ad Auctum Exeqvialem, Qvo Virgo ... Anna Dorothea Viri ... Valentini Alberti, SS. Theol. D. & PP. extraordinarii, ... Filia Desideratissima post horam III. solenniter efferetur, decenter prolixeqve concelebrandum Proceres Civesqve Academicos peramanter invitat'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000767/',
      resource_id: 'urn:madoc:manifest:0000000767',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000767/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000767/manifest.json',
      label: {
        en: [
          'Rector Academiae Lipsiensis Ad Foeminam Clarissimam ac Pientissimam Mariam Elisabetham, natam Bönigkiam, Viri qvondam Nobilissimi, Amplissimi & Experientissimi Dn. Christiani Hoeltzelii, Medicinae Doctoris ac Practici famigerabilis relictam Viduam, qvae hodie post horam I. intra urbem humabitur, supremis honoribus proseqvendam Cives Suos invitat',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000767/',
          id: 'urn:madoc:manifest:0000000767',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsiensis Ad Foeminam Clarissimam ac Pientissimam Mariam Elisabetham, natam Bönigkiam, Viri qvondam Nobilissimi, Amplissimi & Experientissimi Dn. Christiani Hoeltzelii, Medicinae Doctoris ac Practici famigerabilis relictam Viduam, qvae hodie post horam I. intra urbem humabitur, supremis honoribus proseqvendam Cives Suos invitat",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsiensis Ad Foeminam Clarissimam ac Pientissimam Mariam Elisabetham, natam Bönigkiam, Viri qvondam Nobilissimi, Amplissimi & Experientissimi Dn. Christiani Hoeltzelii, Medicinae Doctoris ac Practici famigerabilis relictam Viduam, qvae hodie post horam I. intra urbem humabitur, supremis honoribus proseqvendam Cives Suos invitat'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000858/',
      resource_id: 'urn:madoc:manifest:0000000858',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000858/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000858/manifest.json',
      label: {
        en: [
          'Rector Academiae Lipsiensis Funus Matronae ... Annae Magdalenae Natae Hofmanniae, Viri  ... Isaaci Ölhafii, Haereditarii in Ober- und Nieder-Schölnbach, Relictae Viduae, Post horam III. efferndum solenniter, freqventerqve deducendum, Proceribus Civibusq[ue] Academicis indicit',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000858/',
          id: 'urn:madoc:manifest:0000000858',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsiensis Funus Matronae ... Annae Magdalenae Natae Hofmanniae, Viri  ... Isaaci Ölhafii, Haereditarii in Ober- und Nieder-Schölnbach, Relictae Viduae, Post horam III. efferndum solenniter, freqventerqve deducendum, Proceribus Civibusq[ue] Academicis indicit",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsiensis Funus Matronae ... Annae Magdalenae Natae Hofmanniae, Viri  ... Isaaci Ölhafii, Haereditarii in Ober- und Nieder-Schölnbach, Relictae Viduae, Post horam III. efferndum solenniter, freqventerqve deducendum, Proceribus Civibusq[ue] Academicis indicit'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000975/',
      resource_id: 'urn:madoc:manifest:0000000975',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000975/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000975/manifest.json',
      label: {
        en: [
          'Rector Academiae Lipsiensis Parentalia Rectoris Quondam Magnifici ... Gothofredi Schilteri, Landshuta Silesii, Philos. & J. U. Doct. Prof. Publ. Celeberrimi, & Collegii B. Virg. Collegiati gravissimi, In ipsa eheu! pupura extincti D. XXII. solennissime celebranda Utriusque Reipublicae Proceribus intimat',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000975/',
          id: 'urn:madoc:manifest:0000000975',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsiensis Parentalia Rectoris Quondam Magnifici ... Gothofredi Schilteri, Landshuta Silesii, Philos. & J. U. Doct. Prof. Publ. Celeberrimi, & Collegii B. Virg. Collegiati gravissimi, In ipsa eheu! pupura extincti D. XXII. solennissime celebranda Utriusque Reipublicae Proceribus intimat",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsiensis Parentalia Rectoris Quondam Magnifici ... Gothofredi Schilteri, Landshuta Silesii, Philos. & J. U. Doct. Prof. Publ. Celeberrimi, & Collegii B. Virg. Collegiati gravissimi, In ipsa eheu! pupura extincti D. XXII. solennissime celebranda Utriusque Reipublicae Proceribus intimat'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000542/',
      resource_id: 'urn:madoc:manifest:0000000542',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000542/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000542/manifest.json',
      label: {
        en: [
          'Natalitia Pentecostalia,typis jam olim adumbrata hodiequein templo paulino oratione celebranda solemni Rector Academiae Lipsiensis indicit proceribus ejusdem ac civibus universis',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000542/',
          id: 'urn:madoc:manifest:0000000542',
          type: 'Manifest',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': 'Natalitia Pentecostalia,typis jam olim adumbrata hodiequein templo paulino oratione celebranda solemni <b>Rector</b> Academiae Lipsiensis indicit proceribus ejusdem ac civibus universis",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Natalitia Pentecostalia,typis jam olim adumbrata hodiequein templo paulino oratione celebranda solemni Rector Academiae Lipsiensis indicit proceribus ejusdem ac civibus universis'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000004389/',
      resource_id: 'urn:madoc:manifest:0000004389',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000004389/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000004389/manifest.json',
      label: {
        en: [
          'Deo Sapientiae Et Bonarum Artium Autori Optimo Conservatori Maximo Et Memoriae Honoris In Philosophia Summi Iuvenum Optimorum Doctissimorumque Numero XXV. Sacrum Rectore ... Godofredo Welschio, Phil. & Med. D. Fac. Med. Seniore, Pathol. P.P. Celeberr. Mai. Princ. Colleg. Collegiato, Acad. Decemv. & Reip. Patriae Physico undiquaq[ue] Dignissimo, Procancellario ... Friderico Rappolto, SS. Theol. Licentiato, Poes. P.P. Famigeratissimo, Mai. Princip. Colleg. Collegiato & h.t. Praeposito, Paedag. ad. D. Nicol. Rectore undiquaq[ue] Meritissimo, Decano ... M. Valentino Alberti, Log. & Metaph. P.P. Celeberrimo, Colleg. Mariani Collegiato Dignissimo',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000004389/',
          id: 'urn:madoc:manifest:0000004389',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': 'Deo Sapientiae Et Bonarum Artium Autori Optimo Conservatori Maximo Et Memoriae Honoris In Philosophia Summi Iuvenum Optimorum Doctissimorumque Numero XXV. Sacrum <b>Rectore</b> ... Godofredo Welschio, Phil. & Med. D. Fac. Med. Seniore, Pathol. P.P. Celeberr. Mai. Princ. Colleg. Collegiato, Acad. Decemv. & Reip. Patriae Physico undiquaq[ue] Dignissimo, Procancellario ... Friderico Rappolto ... Theol. Licentiato, Poes. P.P. Famigeratissimo, Mai. Princip. Colleg. Collegiato & h.t. Praeposito, Paedag. ad. D. Nicol. <b>Rectore</b> undiquaq[ue] Meritissimo, Decano ... M. Valentino Alberti, Log. & Metaph. P.P. Celeberrimo, Colleg. Mariani Collegiato Dignissimo",
          language: 'en',
          rank: 2.0,
          original_content:
            "{'label': 'Deo Sapientiae Et Bonarum Artium Autori Optimo Conservatori Maximo Et Memoriae Honoris In Philosophia Summi Iuvenum Optimorum Doctissimorumque Numero XXV. Sacrum Rectore ... Godofredo Welschio, Phil. & Med. D. Fac. Med. Seniore, Pathol. P.P. Celeberr. Mai. Princ. Colleg. Collegiato, Acad. Decemv. & Reip. Patriae Physico undiquaq[ue] Dignissimo, Procancellario ... Friderico Rappolto, SS. Theol. Licentiato, Poes. P.P. Famigeratissimo, Mai. Princip. Colleg. Collegiato & h.t. Praeposito, Paedag. ad. D. Nicol. Rectore undiquaq[ue] Meritissimo, Decano ... M. Valentino Alberti, Log. & Metaph. P.P. Celeberrimo, Colleg. Mariani Collegiato Dignissimo'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000001008/',
      resource_id: 'urn:madoc:manifest:0000001008',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000001008/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000001008/manifest.json',
      label: {
        en: [
          'Rector Universitatis Lipsiensis Ad Exequias Probissimae Matronae, Dominae Christinae natae Berlichiae, Domini Georgi Moebii, SS. Theologiae D. & Professoris Publici apud nos Primarii, & Facultatis Theologicae Senioris, ... Christi bene meriti Conjugis desideratissimae hodie post Sacra pomeridiana instituendas Cives Academicos peramanter invitat',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000001008/',
          id: 'urn:madoc:manifest:0000001008',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Universitatis Lipsiensis Ad Exequias Probissimae Matronae, Dominae Christinae natae Berlichiae, Domini Georgi Moebii, SS. Theologiae D. & Professoris Publici apud nos Primarii, & Facultatis Theologicae Senioris, ... Christi bene meriti Conjugis desideratissimae hodie post Sacra pomeridiana instituendas Cives Academicos peramanter invitat",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Universitatis Lipsiensis Ad Exequias Probissimae Matronae, Dominae Christinae natae Berlichiae, Domini Georgi Moebii, SS. Theologiae D. & Professoris Publici apud nos Primarii, & Facultatis Theologicae Senioris, ... Christi bene meriti Conjugis desideratissimae hodie post Sacra pomeridiana instituendas Cives Academicos peramanter invitat'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000001031/',
      resource_id: 'urn:madoc:manifest:0000001031',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000001031/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000001031/manifest.json',
      label: {
        en: [
          'Rector Universitatis Lipsiensis Exequias Dn. Jacobi Meyeri, Senaroris In Hac Civitate Prudentia Et Fide Eximii, Post hodiernam Horam III. pomeridianam frequentandas Civibus suis indicit',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000001031/',
          id: 'urn:madoc:manifest:0000001031',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Universitatis Lipsiensis Exequias Dn. Jacobi Meyeri, Senaroris In Hac Civitate Prudentia Et Fide Eximii, Post hodiernam Horam III. pomeridianam frequentandas Civibus suis indicit",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Universitatis Lipsiensis Exequias Dn. Jacobi Meyeri, Senaroris In Hac Civitate Prudentia Et Fide Eximii, Post hodiernam Horam III. pomeridianam frequentandas Civibus suis indicit'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000823/',
      resource_id: 'urn:madoc:manifest:0000000823',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000823/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000823/manifest.json',
      label: {
        en: [
          'Rector Academiae Lipsiensis Ad Justa Funebria ... Mariae Magdalenae, Natae Anckelmanniae ... Heinrici Schmidii a Schmidefeld, Haereditarii in Stötteritz Relictae Viduae Frequentibus exequiis post horam I. persolvenda Proceres Civesq[ue] ... invitat',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000823/',
          id: 'urn:madoc:manifest:0000000823',
          type: 'Manifest',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsiensis Ad Justa Funebria ... Mariae Magdalenae, Natae Anckelmanniae ... Heinrici Schmidii a Schmidefeld, Haereditarii in Stötteritz Relictae Viduae Frequentibus exequiis post horam I. persolvenda Proceres Civesq[ue] ... invitat",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsiensis Ad Justa Funebria ... Mariae Magdalenae, Natae Anckelmanniae ... Heinrici Schmidii a Schmidefeld, Haereditarii in Stötteritz Relictae Viduae Frequentibus exequiis post horam I. persolvenda Proceres Civesq[ue] ... invitat'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000841/',
      resource_id: 'urn:madoc:manifest:0000000841',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000841/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000841/manifest.json',
      label: {
        en: [
          'Rector Academiae Lipsiensis Ad Funus Viri ... Joh. Caspari Pflaumii, Philos. & J.U. Doctoris famigerabilis, Curiae Supremae Electoralis ac Ducalis, quae hic est, Advocati Ordinarii, Judicii Provincialis in Lusatia inferiore Assessoris, Minoris Principum Collegii Collegiati, & Praetoris in Curia oppidana Senioris ... Frequenti officio post horam I. qua ad Dormitorium Paulinum deducetur, prosequendum Proceres Civesq[ue] Academicos, honorem cuique suum praefatus, invitat',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000841/',
          id: 'urn:madoc:manifest:0000000841',
          type: 'Manifest',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsiensis Ad Funus Viri ... Joh. Caspari Pflaumii, Philos. & J.U. Doctoris famigerabilis, Curiae Supremae Electoralis ac Ducalis, quae hic est, Advocati Ordinarii, Judicii Provincialis in Lusatia inferiore Assessoris, Minoris Principum Collegii Collegiati, & Praetoris in Curia oppidana Senioris ... Frequenti officio post horam I. qua ad Dormitorium Paulinum deducetur, prosequendum",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsiensis Ad Funus Viri ... Joh. Caspari Pflaumii, Philos. & J.U. Doctoris famigerabilis, Curiae Supremae Electoralis ac Ducalis, quae hic est, Advocati Ordinarii, Judicii Provincialis in Lusatia inferiore Assessoris, Minoris Principum Collegii Collegiati, & Praetoris in Curia oppidana Senioris ... Frequenti officio post horam I. qua ad Dormitorium Paulinum deducetur, prosequendum Proceres Civesq[ue] Academicos, honorem cuique suum praefatus, invitat'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000790/',
      resource_id: 'urn:madoc:manifest:0000000790',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000790/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000790/manifest.json',
      label: {
        en: [
          'Rector Academiae Lipsiensis Ad Exeqvias Foeminae ...  Sabinae, natae Ritschiae Viri ... Jacobi Gerdesii J. U. Candidati Ucoris desideratissimae Spissocomitatu hora III. cohonestandas Proceres Civesqve Academicos Officiose ac peramanter invitat',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000790/',
          id: 'urn:madoc:manifest:0000000790',
          type: 'Manifest',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsiensis Ad Exeqvias Foeminae ...  Sabinae, natae Ritschiae Viri ... Jacobi Gerdesii J. U. Candidati Ucoris desideratissimae Spissocomitatu hora III. cohonestandas Proceres Civesqve Academicos Officiose ac peramanter invitat",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsiensis Ad Exeqvias Foeminae ...  Sabinae, natae Ritschiae Viri ... Jacobi Gerdesii J. U. Candidati Ucoris desideratissimae Spissocomitatu hora III. cohonestandas Proceres Civesqve Academicos Officiose ac peramanter invitat'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000013238/',
      resource_id: 'urn:madoc:manifest:0000013238',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000013238/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000013238/manifest.json',
      label: {
        en: [
          'Rector Academiae Lipsiensis ad exequias Viri Amplißimi, Nobilißimi & Experientißimi Dn. Christiani Langii Phil. & Med. Doctoris, Fac. Medicae Senioris, Pathologices Prof. Publ. celeberrimi, Collegii Principum majoris Collegiati, Academiae Decemviri dignissimi & Practici felicissimi, post auditam III. pomer. Cives Academicos invitat',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000013238/',
          id: 'urn:madoc:manifest:0000013238',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsiensis ad exequias Viri Amplißimi, Nobilißimi & Experientißimi Dn. Christiani Langii Phil. & Med. Doctoris, Fac. Medicae Senioris, Pathologices Prof. Publ. celeberrimi, Collegii Principum majoris Collegiati, Academiae Decemviri dignissimi & Practici felicissimi, post auditam III. pomer. Cives Academicos invitat",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsiensis ad exequias Viri Amplißimi, Nobilißimi & Experientißimi Dn. Christiani Langii Phil. & Med. Doctoris, Fac. Medicae Senioris, Pathologices Prof. Publ. celeberrimi, Collegii Principum majoris Collegiati, Academiae Decemviri dignissimi & Practici felicissimi, post auditam III. pomer. Cives Academicos invitat'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000530/',
      resource_id: 'urn:madoc:manifest:0000000530',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000530/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000530/manifest.json',
      label: {
        en: ['Rector Academiae Lipsensis ad Paschalia Salvatoris Solennia Cives Invitat Academicos'],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000530/',
          id: 'urn:madoc:manifest:0000000530',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsensis ad Paschalia Salvatoris Solennia Cives Invitat Academicos",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsensis ad Paschalia Salvatoris Solennia Cives Invitat Academicos'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000777/',
      resource_id: 'urn:madoc:manifest:0000000777',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000777/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000777/manifest.json',
      label: {
        en: [
          'Rector Universitatis Lipsiensis, Ad Exequias Nobilissimae Foeminae, Dominae Mariae Margarethae, natae Planckiae, Domini D. Augusti Benedicti Carpzovii, Pandectarum Professoris Publici, in Dicasterio Provinciali Supremo, in Consistorio Ecclesiastico, in Facultate Juridica Assessoris, & Canonici Naumburgensis, Conjugis Charissimae, Hodie III. Julii MDCXCVIII. post sacra vespertina frequenti comitatu deducendas, Cives Suos invitat',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000777/',
          id: 'urn:madoc:manifest:0000000777',
          type: 'Manifest',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Universitatis Lipsiensis, Ad Exequias Nobilissimae Foeminae, Dominae Mariae Margarethae, natae Planckiae, Domini D. Augusti Benedicti Carpzovii, Pandectarum Professoris Publici, in Dicasterio Provinciali Supremo, in Consistorio Ecclesiastico, in Facultate Juridica Assessoris, & Canonici Naumburgensis, Conjugis Charissimae, Hodie III. Julii MDCXCVIII. post sacra vespertina frequenti comitatu deducendas, Cives Suos invitat",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Universitatis Lipsiensis, Ad Exequias Nobilissimae Foeminae, Dominae Mariae Margarethae, natae Planckiae, Domini D. Augusti Benedicti Carpzovii, Pandectarum Professoris Publici, in Dicasterio Provinciali Supremo, in Consistorio Ecclesiastico, in Facultate Juridica Assessoris, & Canonici Naumburgensis, Conjugis Charissimae, Hodie III. Julii MDCXCVIII. post sacra vespertina frequenti comitatu deducendas, Cives Suos invitat'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000815/',
      resource_id: 'urn:madoc:manifest:0000000815',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000815/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000815/manifest.json',
      label: {
        en: [
          'Rector Academiae Lipsiensis ad Exuvias Viri Eximii Clarissimiqve Dn. Christiani Jaegerdoerfferi, J. U. Candidati dignissimi, honesto funere post horam I. efferndas Proceres Civesqve Academicos adesse jubet',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000815/',
          id: 'urn:madoc:manifest:0000000815',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsiensis ad Exuvias Viri Eximii Clarissimiqve Dn. Christiani Jaegerdoerfferi, J. U. Candidati dignissimi, honesto funere post horam I. efferndas Proceres Civesqve Academicos adesse jubet",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsiensis ad Exuvias Viri Eximii Clarissimiqve Dn. Christiani Jaegerdoerfferi, J. U. Candidati dignissimi, honesto funere post horam I. efferndas Proceres Civesqve Academicos adesse jubet'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000297/',
      resource_id: 'urn:madoc:manifest:0000000297',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000297/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000297/manifest.json',
      label: {
        en: ['Rector Academiae Lipsiensis Trahndorfianae Uxoris Nobilissimae Funus indicit'],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000297/',
          id: 'urn:madoc:manifest:0000000297',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet: "label': '<b>Rector</b> Academiae Lipsiensis Trahndorfianae Uxoris Nobilissimae Funus indicit",
          language: 'en',
          rank: 1.0,
          original_content: "{'label': 'Rector Academiae Lipsiensis Trahndorfianae Uxoris Nobilissimae Funus indicit'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000811/',
      resource_id: 'urn:madoc:manifest:0000000811',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000811/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000811/manifest.json',
      label: {
        en: [
          'Rector Academiae Lipsiensis Ad Exeqvias Viri Praenobilis atq[ue] Consultissimi Dn. Johannis Lohsii, Inclytae Reipublicae Lipsiensis a Libellis rationum, Hodiè post horam III. cumulatissimè freqventandas, Proceres Civesq[ue] Academicos officiose ac peramanter invitat',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000811/',
          id: 'urn:madoc:manifest:0000000811',
          type: 'Manifest',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsiensis Ad Exeqvias Viri Praenobilis atq[ue] Consultissimi Dn. Johannis Lohsii, Inclytae Reipublicae Lipsiensis a Libellis rationum, Hodiè post horam III. cumulatissimè freqventandas, Proceres Civesq[ue] Academicos officiose ac peramanter invitat",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsiensis Ad Exeqvias Viri Praenobilis atq[ue] Consultissimi Dn. Johannis Lohsii, Inclytae Reipublicae Lipsiensis a Libellis rationum, Hodiè post horam III. cumulatissimè freqventandas, Proceres Civesq[ue] Academicos officiose ac peramanter invitat'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000008988/',
      resource_id: 'urn:madoc:manifest:0000008988',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000008988/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000008988/manifest.json',
      label: {
        en: ['Rector et consilium perpetuum in academia Lipsiensi ...'],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000008988/',
          id: 'urn:madoc:manifest:0000008988',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet: "label': '<b>Rector</b> et consilium perpetuum in academia Lipsiensi",
          language: 'en',
          rank: 1.0,
          original_content: "{'label': 'Rector et consilium perpetuum in academia Lipsiensi ...'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000506/',
      resource_id: 'urn:madoc:manifest:0000000506',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000506/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000506/manifest.json',
      label: {
        en: [
          'Ad audiendum mysterium resurrectionis dominicae, quod soli crediderunt et sperarunt Christiani ... invitat Rector Academiae Lipsiensis proceres ac cives ejusdem',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000506/',
          id: 'urn:madoc:manifest:0000000506',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': 'Ad audiendum mysterium resurrectionis dominicae, quod soli crediderunt et sperarunt Christiani ... invitat <b>Rector</b> Academiae Lipsiensis proceres ac cives ejusdem",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Ad audiendum mysterium resurrectionis dominicae, quod soli crediderunt et sperarunt Christiani ... invitat Rector Academiae Lipsiensis proceres ac cives ejusdem'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000001039/',
      resource_id: 'urn:madoc:manifest:0000001039',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000001039/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000001039/manifest.json',
      label: {
        en: [
          'Rector Universitatis Lipsiensis Funus Nobilisimae Matronae, Mariae Felicitatis, natae Hermanniae, Dn. Johannis Grossii, Senatoris Et Aedilis In Hac Urbe Meritissimi, Uxoris Viduae, Hodie XVI. Aprilis MDCIC. hora III.ad Sepulturam efferendum Civibus suis indicit',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000001039/',
          id: 'urn:madoc:manifest:0000001039',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Universitatis Lipsiensis Funus Nobilisimae Matronae, Mariae Felicitatis, natae Hermanniae, Dn. Johannis Grossii, Senatoris Et Aedilis In Hac Urbe Meritissimi, Uxoris Viduae, Hodie XVI. Aprilis MDCIC. hora III.ad Sepulturam efferendum Civibus suis indicit",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Universitatis Lipsiensis Funus Nobilisimae Matronae, Mariae Felicitatis, natae Hermanniae, Dn. Johannis Grossii, Senatoris Et Aedilis In Hac Urbe Meritissimi, Uxoris Viduae, Hodie XVI. Aprilis MDCIC. hora III.ad Sepulturam efferendum Civibus suis indicit'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000859/',
      resource_id: 'urn:madoc:manifest:0000000859',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000859/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000859/manifest.json',
      label: {
        en: [
          'Rector Academiae Lipsiensis Funus Probae Matronae Susannae, Natae Weberiae, Domini Joh. Christiani Hippii, Philosophiae & Medicinae Doctoris, & Facultatis Medicae Assessoris, Viduae Hodie XX. Februar. M DC XCVIII. Finitis Sacris pomeridianis, usitatis ceremoniis efferendum Intimat',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000859/',
          id: 'urn:madoc:manifest:0000000859',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsiensis Funus Probae Matronae Susannae, Natae Weberiae, Domini Joh. Christiani Hippii, Philosophiae & Medicinae Doctoris, & Facultatis Medicae Assessoris, Viduae Hodie XX. Februar. M DC XCVIII. Finitis Sacris pomeridianis, usitatis ceremoniis efferendum Intimat",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsiensis Funus Probae Matronae Susannae, Natae Weberiae, Domini Joh. Christiani Hippii, Philosophiae & Medicinae Doctoris, & Facultatis Medicae Assessoris, Viduae Hodie XX. Februar. M DC XCVIII. Finitis Sacris pomeridianis, usitatis ceremoniis efferendum Intimat'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/iiif/urn:madoc:manifest:0000000820/',
      resource_id: 'urn:madoc:manifest:0000000820',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000820/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000820/manifest.json',
      label: {
        en: [
          'Rector Academiae Lipsiensis ad Officium humanitatis ultimum. Foeminae prosapiae ac virtutum splendore non minus, quam aetate florentissimae  Christinae Sophiae natae Oheimiae, Viri ... Joh. Wilhelmi Pauli, Philos. & Medicinae Doctoris, hujusque Practici famigerabilis, Conjugi hactenus dilectissimae, nunc desideratissimae, Post horam III. cumulatissime praestandum Proceres Civesqve Academicos diligenter adhortatur',
        ],
      },
      context: [
        {
          url: 'http://localhost:8000/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c/',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocsite2/',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
        {
          url: 'http://localhost:8000/contexts/urnmadocmanifest0000000820/',
          id: 'urn:madoc:manifest:0000000820',
          type: 'Manifest',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': '<b>Rector</b> Academiae Lipsiensis ad Officium humanitatis ultimum. Foeminae prosapiae ac virtutum splendore non minus, quam aetate florentissimae  Christinae Sophiae natae Oheimiae, Viri ... Joh. Wilhelmi Pauli, Philos. & Medicinae Doctoris, hujusque Practici famigerabilis, Conjugi hactenus dilectissimae, nunc desideratissimae, Post horam III. cumulatissime praestandum Proceres Civesqve Academicos diligenter adhortatur",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Rector Academiae Lipsiensis ad Officium humanitatis ultimum. Foeminae prosapiae ac virtutum splendore non minus, quam aetate florentissimae  Christinae Sophiae natae Oheimiae, Viri ... Joh. Wilhelmi Pauli, Philos. & Medicinae Doctoris, hujusque Practici famigerabilis, Conjugi hactenus dilectissimae, nunc desideratissimae, Post horam III. cumulatissime praestandum Proceres Civesqve Academicos diligenter adhortatur'}",
        },
      ],
    },
  ],
  facets: {
    metadata: {
      author: {
        '': 171,
        'Henrici, Daniel': 7,
        'Carpzov, Johann Benedict': 5,
        'Feller, Joachim': 4,
        'Kromayer, Hieronymus': 4,
        'Pfautz, Christoph': 3,
        'Alberti, Valentin': 2,
        'Ernesti, Johann Heinrich': 2,
        'Ittig, Thomas': 2,
        'Carpzov, Samuel Benedikt': 1,
      },
      'call number': {
        '01E-2014-55': 1,
        'Fam.265/10': 1,
        'Fam.265/100': 1,
        'Fam.265/102': 1,
        'Fam.265/103': 1,
        'Fam.265/104': 1,
        'Fam.265/105': 1,
        'Fam.265/106': 1,
        'Fam.265/112': 1,
        'Fam.265/114': 1,
      },
      collection: {
        VD17: 420,
        'Drucke des 17. Jahrhunderts': 5,
      },
      comment: {
        'Ex. beschädigt': 1,
      },
      'date of publication': {
        '1680': 17,
        '1682': 16,
        '1681': 13,
        '1685': 10,
        '1691': 10,
        '1692': 10,
        '1694': 9,
        '1695': 9,
        '1678': 8,
        '1684': 8,
      },
      kitodo: {
        '10371': 1,
        '10516': 1,
        '10814': 1,
        '11130': 1,
        '14054': 1,
        '3267': 1,
        '3268': 1,
        '3270': 1,
        '3277': 1,
        '3278': 1,
      },
      'manifest type': {
        monograph: 213,
      },
      owner: {
        'Leipzig University Library': 213,
      },
      'physical description': {
        '[2] Bl.': 176,
        '[6] Bl.': 9,
        '[4] Bl.': 6,
        '4 ungezählte Seiten': 4,
        '[12] Bl.': 2,
        '[1] Bl.': 2,
        '1 Blatt': 2,
        '[20] Bl.': 2,
        '[22] Bl.': 2,
        '[11] Bl.': 1,
      },
      'place of publication': {
        '[Lipsiae]': 106,
        Lipsiae: 78,
        '[Leipzig]': 10,
        '[S.l.]': 7,
        Lipsiæ: 5,
        Gorlicii: 1,
        Jenae: 1,
        Leucopetræ: 1,
        'Lippiæ [!]': 1,
        'Lips.': 1,
      },
      publisher: {
        '': 36,
        Georgius: 20,
        Wittigau: 13,
        Fleischerus: 10,
        Scholvinus: 10,
        Krügerus: 9,
        Georg: 6,
        Krüger: 6,
        Fleischer: 5,
        Güntherus: 5,
      },
      related: {
        "{'en': ['Attribution']}": 426,
      },
      'source ppn (swb)': {
        '022413952': 1,
        '027152863': 1,
        '049629018': 1,
        '055719538': 1,
        '055724892': 1,
        '055726070': 1,
        '055737692': 1,
        '055746748': 1,
        '055747612': 1,
        '055750931': 1,
      },
      urn: {
        'urn:nbn:de:bsz:15-0008-100335': 1,
        'urn:nbn:de:bsz:15-0008-100519': 1,
        'urn:nbn:de:bsz:15-0008-102185': 1,
        'urn:nbn:de:bsz:15-0008-102207': 1,
        'urn:nbn:de:bsz:15-0008-102840': 1,
        'urn:nbn:de:bsz:15-0008-102852': 1,
        'urn:nbn:de:bsz:15-0008-102861': 1,
        'urn:nbn:de:bsz:15-0008-102873': 1,
        'urn:nbn:de:bsz:15-0008-102880': 1,
        'urn:nbn:de:bsz:15-0008-102907': 1,
      },
      vd17: {
        'VD17 1:045757R': 1,
        'VD17 125:006458Y': 1,
        'VD17 125:014009W': 1,
        'VD17 125:022751A': 1,
        'VD17 125:024313B': 1,
        'VD17 125:025808Q': 1,
        'VD17 125:028447Z': 1,
        'VD17 125:031457D': 1,
        'VD17 125:031476K': 1,
        'VD17 125:031482L': 1,
      },
    },
  },
};

const options = [
  { value: 'Option1', text: 'Option 1' },
  { value: 'Option2', text: 'Option 2' },
  { value: 'Option3', text: 'Option 3' },
];

const facets = [
  { name: 'First Facet', options: options },
  { name: 'Second Facet', options: options },
  { name: 'Third Facet', options: options },
];

const SearchContainer = styled.div`
  display: flex;
`;

export const HeaderWithBreadcrumbsAndMenuAndSearch = () => (
  <MemoryRouter>
    <Header
      title={text('Site Title', 'Site Title')}
      breadcrumbs={[
        { label: 'Home', link: '#' },
        { label: 'Search', link: '#', active: true },
      ]}
      menu={[
        { label: 'Home', link: '#' },
        { label: 'Collections', link: '#' },
        { label: 'Projects', link: '#', active: true },
        { label: 'Resources', link: '#' },
      ]}
      search={true}
      searchFunction={val => {
        alert('you searched for:  ' + val);
      }}
    />
    <WidePage>
      <SearchContainer>
        <SearchFacets
          facets={facets}
          facetChange={(val, facet) => alert('you changed Facet ' + facet + ' to the value ' + val)}
        />
        <SearchResults
          searchFunction={val => {
            alert('you searched for:  ' + val);
          }}
          totalResults={dummyResults.pagination.totalResults}
          searchResults={dummyResults.results}
          sortByFunction={val => {
            alert('you sorted by:  ' + val);
          }}
        />
      </SearchContainer>
      <PaginationNumbered
        page={number('Page Number', dummyResults.pagination.page)}
        totalPages={number('Total Pages', dummyResults.pagination.totalPages)}
        stale={false}
      />
    </WidePage>
  </MemoryRouter>
);
