/**
 * @jest-environment jsdom
 */
import { parseRdfVocab } from '../../../src/frontend/shared/capture-models/helpers/rdf-vocab/rdf-vocab';

describe('RDF Vocab', () => {
  test('parse dublin core', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE rdf:RDF [
          <!ENTITY rdfns 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'>
          <!ENTITY rdfsns 'http://www.w3.org/2000/01/rdf-schema#'>
          <!ENTITY dcns 'http://purl.org/dc/elements/1.1/'>
          <!ENTITY dctermsns 'http://purl.org/dc/terms/'>
          <!ENTITY dctypens 'http://purl.org/dc/dcmitype/'>
          <!ENTITY dcamns 'http://purl.org/dc/dcam/'>
          <!ENTITY skosns 'http://www.w3.org/2004/02/skos/core#'>
          <!ENTITY owlns 'http://www.w3.org/2002/07/owl#'>
          ]>
        <rdf:RDF xmlns:owl="http://www.w3.org/2002/07/owl#" 
                 xmlns:skos="http://www.w3.org/2004/02/skos/core#"
                 xmlns:dcam="http://purl.org/dc/dcam/" 
                 xmlns:dcterms="http://purl.org/dc/terms/"
                 xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                 xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">
            <rdf:Description rdf:about="http://purl.org/dc/terms/">
                <dcterms:title xml:lang="en">DCMI Metadata Terms - other</dcterms:title>
                <dcterms:publisher rdf:resource="http://purl.org/dc/aboutdcmi#DCMI"/>
                <dcterms:modified rdf:datatype="http://www.w3.org/2001/XMLSchema#date">2012-06-14</dcterms:modified>
            </rdf:Description>
            <rdf:Description rdf:about="http://purl.org/dc/terms/title">
                <rdfs:label xml:lang="en">Title</rdfs:label>
                <rdfs:comment xml:lang="en">A name given to the resource.</rdfs:comment>
                <rdfs:isDefinedBy rdf:resource="http://purl.org/dc/terms/"/>
                <dcterms:issued rdf:datatype="http://www.w3.org/2001/XMLSchema#date">2008-01-14</dcterms:issued>
                <dcterms:modified rdf:datatype="http://www.w3.org/2001/XMLSchema#date">2010-10-11</dcterms:modified>
                <rdf:type rdf:resource="http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"/>
                <dcterms:hasVersion rdf:resource="http://dublincore.org/usage/terms/history/#titleT-002"/>
                <rdfs:range rdf:resource="http://www.w3.org/2000/01/rdf-schema#Literal"/>
                <rdfs:subPropertyOf rdf:resource="http://purl.org/dc/elements/1.1/title"/>
            </rdf:Description>
            <rdf:Description rdf:about="http://purl.org/dc/terms/creator">
                <rdfs:label xml:lang="en">Creator</rdfs:label>
                <rdfs:comment xml:lang="en">An entity primarily responsible for making the resource.</rdfs:comment>
                <dcterms:description xml:lang="en">Examples of a Creator include a person, an organization, or a service.
                </dcterms:description>
                <rdfs:isDefinedBy rdf:resource="http://purl.org/dc/terms/"/>
                <dcterms:issued rdf:datatype="http://www.w3.org/2001/XMLSchema#date">2008-01-14</dcterms:issued>
                <dcterms:modified rdf:datatype="http://www.w3.org/2001/XMLSchema#date">2010-10-11</dcterms:modified>
                <rdf:type rdf:resource="http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"/>
                <dcterms:hasVersion rdf:resource="http://dublincore.org/usage/terms/history/#creatorT-002"/>
                <rdfs:range rdf:resource="http://purl.org/dc/terms/Agent"/>
                <rdfs:subPropertyOf rdf:resource="http://purl.org/dc/elements/1.1/creator"/>
                <rdfs:subPropertyOf rdf:resource="http://purl.org/dc/terms/contributor"/>
                <owl:equivalentProperty rdf:resource="http://xmlns.com/foaf/0.1/maker"/>
            </rdf:Description>
            <rdf:Description rdf:about="http://purl.org/dc/terms/subject">
                <rdfs:label xml:lang="en">Subject</rdfs:label>
                <rdfs:comment xml:lang="en">The topic of the resource.</rdfs:comment>
                <dcterms:description xml:lang="en">Typically, the subject will be represented using keywords, key phrases, or
                    classification codes. Recommended best practice is to use a controlled vocabulary.
                </dcterms:description>
                <rdfs:isDefinedBy rdf:resource="http://purl.org/dc/terms/"/>
                <dcterms:issued rdf:datatype="http://www.w3.org/2001/XMLSchema#date">2008-01-14</dcterms:issued>
                <dcterms:modified rdf:datatype="http://www.w3.org/2001/XMLSchema#date">2012-06-14</dcterms:modified>
                <rdf:type rdf:resource="http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"/>
                <dcterms:hasVersion rdf:resource="http://dublincore.org/usage/terms/history/#subjectT-002"/>
                <skos:note xml:lang="en">This term is intended to be used with non-literal values as defined in the DCMI
                    Abstract Model (http://dublincore.org/documents/abstract-model/). As of December 2007, the DCMI Usage Board
                    is seeking a way to express this intention with a formal range declaration.
                </skos:note>
                <rdfs:subPropertyOf rdf:resource="http://purl.org/dc/elements/1.1/subject"/>
            </rdf:Description>
            <rdf:Description rdf:about="http://purl.org/dc/terms/BibliographicResource">
                <rdfs:label xml:lang="en">Bibliographic Resource</rdfs:label>
                <rdfs:comment xml:lang="en">A book, article, or other documentary resource.</rdfs:comment>
                <rdfs:isDefinedBy rdf:resource="http://purl.org/dc/terms/"/>
                <dcterms:issued rdf:datatype="http://www.w3.org/2001/XMLSchema#date">2008-01-14</dcterms:issued>
                <rdf:type rdf:resource="http://www.w3.org/2000/01/rdf-schema#Class"/>
                <dcterms:hasVersion rdf:resource="http://dublincore.org/usage/terms/history/#BibliographicResource-001"/>
            </rdf:Description>
            <rdf:Description rdf:about="http://purl.org/dc/terms/FileFormat">
                <rdfs:label xml:lang="en">File Format</rdfs:label>
                <rdfs:comment xml:lang="en">A digital resource format.</rdfs:comment>
                <dcterms:description xml:lang="en">Examples include the formats defined by the list of Internet Media Types.</dcterms:description>
                <rdfs:isDefinedBy rdf:resource="http://purl.org/dc/terms/"/>
                <dcterms:issued rdf:datatype="http://www.w3.org/2001/XMLSchema#date">2008-01-14</dcterms:issued>
                <rdf:type rdf:resource="http://www.w3.org/2000/01/rdf-schema#Class"/>
                <dcterms:hasVersion rdf:resource="http://dublincore.org/usage/terms/history/#FileFormat-001"/>
                <rdfs:subClassOf rdf:resource="http://purl.org/dc/terms/MediaType"/>
            </rdf:Description>
            <rdf:Description rdf:about="http://purl.org/dc/terms/Frequency">
                <rdfs:label xml:lang="en">Frequency</rdfs:label>
                <rdfs:comment xml:lang="en">A rate at which something recurs.</rdfs:comment>
                <rdfs:isDefinedBy rdf:resource="http://purl.org/dc/terms/"/>
                <dcterms:issued rdf:datatype="http://www.w3.org/2001/XMLSchema#date">2008-01-14</dcterms:issued>
                <rdf:type rdf:resource="http://www.w3.org/2000/01/rdf-schema#Class"/>
                <dcterms:hasVersion rdf:resource="http://dublincore.org/usage/terms/history/#Frequency-001"/>
            </rdf:Description>
            <rdf:Description rdf:about="http://purl.org/dc/terms/Jurisdiction">
                <rdfs:label xml:lang="en">Jurisdiction</rdfs:label>
                <rdfs:comment xml:lang="en">The extent or range of judicial, law enforcement, or other authority.</rdfs:comment>
                <rdfs:isDefinedBy rdf:resource="http://purl.org/dc/terms/"/>
                <dcterms:issued rdf:datatype="http://www.w3.org/2001/XMLSchema#date">2008-01-14</dcterms:issued>
                <rdf:type rdf:resource="http://www.w3.org/2000/01/rdf-schema#Class"/>
                <dcterms:hasVersion rdf:resource="http://dublincore.org/usage/terms/history/#Jurisdiction-001"/>
                <rdfs:subClassOf rdf:resource="http://purl.org/dc/terms/LocationPeriodOrJurisdiction"/>
            </rdf:Description>
        </rdf:RDF>
    `;

    expect(parseRdfVocab(xml)).toMatchInlineSnapshot(`
      Object {
        "classes": Array [
          Object {
            "description": "A book, article, or other documentary resource.",
            "label": "Bibliographic Resource",
            "term": "dcterms:BibliographicResource",
            "uri": "http://purl.org/dc/terms/BibliographicResource",
          },
          Object {
            "description": "A digital resource format.",
            "label": "File Format",
            "term": "dcterms:FileFormat",
            "uri": "http://purl.org/dc/terms/FileFormat",
          },
          Object {
            "description": "A rate at which something recurs.",
            "label": "Frequency",
            "term": "dcterms:Frequency",
            "uri": "http://purl.org/dc/terms/Frequency",
          },
          Object {
            "description": "The extent or range of judicial, law enforcement, or other authority.",
            "label": "Jurisdiction",
            "term": "dcterms:Jurisdiction",
            "uri": "http://purl.org/dc/terms/Jurisdiction",
          },
        ],
        "namespaces": Object {
          "dcam": "http://purl.org/dc/dcam/",
          "dcterms": "http://purl.org/dc/terms/",
          "owl": "http://www.w3.org/2002/07/owl#",
          "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
          "skos": "http://www.w3.org/2004/02/skos/core#",
        },
        "properties": Array [
          Object {
            "description": "A name given to the resource.",
            "label": "Title",
            "term": "dcterms:title",
            "uri": "http://purl.org/dc/terms/title",
          },
          Object {
            "description": "An entity primarily responsible for making the resource.",
            "label": "Creator",
            "term": "dcterms:creator",
            "uri": "http://purl.org/dc/terms/creator",
          },
          Object {
            "description": "The topic of the resource.",
            "label": "Subject",
            "term": "dcterms:subject",
            "uri": "http://purl.org/dc/terms/subject",
          },
        ],
      }
    `);
  });

  test('parse foaf', () => {
    const xml = `
      <rdf:RDF
          xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
          xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
          xmlns:owl="http://www.w3.org/2002/07/owl#"
          xmlns:vs="http://www.w3.org/2003/06/sw-vocab-status/ns#"
          xmlns:foaf="http://xmlns.com/foaf/0.1/"
          xmlns:wot="http://xmlns.com/wot/0.1/"
          xmlns:dc="http://purl.org/dc/elements/1.1/">
      <owl:Ontology rdf:about="http://xmlns.com/foaf/0.1/" dc:title="Friend of a Friend (FOAF) vocabulary"
                    dc:description="The Friend of a Friend (FOAF) RDF vocabulary, described using W3C RDF Schema and the Web Ontology Language.">
      </owl:Ontology>

      <rdfs:Class rdf:about="http://xmlns.com/foaf/0.1/LabelProperty" vs:term_status="unstable">
          <rdfs:label>Label Property</rdfs:label>
          <rdfs:comment>A foaf:LabelProperty is any RDF property with texual values that serve as labels.</rdfs:comment>
          <rdf:type rdf:resource="http://www.w3.org/2002/07/owl#Class"/>
          <rdfs:isDefinedBy rdf:resource="http://xmlns.com/foaf/0.1/"/>
      </rdfs:Class>
  
      <rdfs:Class rdf:about="http://xmlns.com/foaf/0.1/Person" rdfs:label="Person" rdfs:comment="A person."
                  vs:term_status="stable">
          <rdf:type rdf:resource="http://www.w3.org/2002/07/owl#Class"/>
          <rdfs:subClassOf>
              <owl:Class rdf:about="http://xmlns.com/foaf/0.1/Agent"/>
          </rdfs:subClassOf>
          <rdfs:subClassOf>
              <owl:Class rdf:about="http://www.w3.org/2000/10/swap/pim/contact#Person" rdfs:label="Person"/>
          </rdfs:subClassOf>
          <rdfs:subClassOf>
              <owl:Class rdf:about="http://www.w3.org/2003/01/geo/wgs84_pos#SpatialThing" rdfs:label="Spatial Thing"/>
          </rdfs:subClassOf>
          <rdfs:isDefinedBy rdf:resource="http://xmlns.com/foaf/0.1/"/>
  
          <owl:disjointWith rdf:resource="http://xmlns.com/foaf/0.1/Organization"/>
          <owl:disjointWith rdf:resource="http://xmlns.com/foaf/0.1/Project"/>
      </rdfs:Class>

      <rdf:Property rdf:about="http://xmlns.com/foaf/0.1/birthday" vs:term_status="unstable" rdfs:label="birthday"
                    rdfs:comment="The birthday of this Agent, represented in mm-dd string form, eg. '12-31'.">
          <rdf:type rdf:resource="http://www.w3.org/2002/07/owl#FunctionalProperty"/>
          <rdf:type rdf:resource="http://www.w3.org/2002/07/owl#DatatypeProperty"/>
          <rdfs:domain rdf:resource="http://xmlns.com/foaf/0.1/Agent"/>
          <rdfs:range rdf:resource="http://www.w3.org/2000/01/rdf-schema#Literal"/>
          <rdfs:isDefinedBy rdf:resource="http://xmlns.com/foaf/0.1/"/>
      </rdf:Property>
  
      <rdf:Property rdf:about="http://xmlns.com/foaf/0.1/age" vs:term_status="unstable" rdfs:label="age"
                    rdfs:comment="The age in years of some agent.">
          <rdf:type rdf:resource="http://www.w3.org/2002/07/owl#FunctionalProperty"/>
          <rdf:type rdf:resource="http://www.w3.org/2002/07/owl#DatatypeProperty"/>
          <rdfs:domain rdf:resource="http://xmlns.com/foaf/0.1/Agent"/>
          <rdfs:range rdf:resource="http://www.w3.org/2000/01/rdf-schema#Literal"/>
          <rdfs:isDefinedBy rdf:resource="http://xmlns.com/foaf/0.1/"/>
      </rdf:Property>
  
      <rdf:Property rdf:about="http://xmlns.com/foaf/0.1/status" vs:term_status="unstable" rdfs:label="status"
                    rdfs:comment="A string expressing what the user is happy for the general public (normally) to know about their current activity.">
          <rdf:type rdf:resource="http://www.w3.org/2002/07/owl#DatatypeProperty"/>
          <rdfs:domain rdf:resource="http://xmlns.com/foaf/0.1/Agent"/>
          <rdfs:range rdf:resource="http://www.w3.org/2000/01/rdf-schema#Literal"/>
          <rdfs:isDefinedBy rdf:resource="http://xmlns.com/foaf/0.1/"/>
      </rdf:Property>
  
  </rdf:RDF>
    `;

    expect(parseRdfVocab(xml)).toMatchInlineSnapshot(`
      Object {
        "classes": Array [
          Object {
            "description": "A foaf:LabelProperty is any RDF property with texual values that serve as labels.",
            "label": "Label Property",
            "term": "foaf:LabelProperty",
            "uri": "http://xmlns.com/foaf/0.1/LabelProperty",
          },
          Object {
            "description": "A person.",
            "label": "Person",
            "term": "foaf:Person",
            "uri": "http://xmlns.com/foaf/0.1/Person",
          },
          Object {
            "description": null,
            "label": "Person",
            "term": "http://www.w3.org/2000/10/swap/pim/contact#Person",
            "uri": "http://www.w3.org/2000/10/swap/pim/contact#Person",
          },
          Object {
            "description": null,
            "label": "Spatial Thing",
            "term": "http://www.w3.org/2003/01/geo/wgs84_pos#SpatialThing",
            "uri": "http://www.w3.org/2003/01/geo/wgs84_pos#SpatialThing",
          },
        ],
        "namespaces": Object {
          "dc": "http://purl.org/dc/elements/1.1/",
          "foaf": "http://xmlns.com/foaf/0.1/",
          "owl": "http://www.w3.org/2002/07/owl#",
          "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
          "vs": "http://www.w3.org/2003/06/sw-vocab-status/ns#",
          "wot": "http://xmlns.com/wot/0.1/",
        },
        "properties": Array [
          Object {
            "description": "The birthday of this Agent, represented in mm-dd string form, eg. '12-31'.",
            "label": "birthday",
            "term": "foaf:birthday",
            "uri": "http://xmlns.com/foaf/0.1/birthday",
          },
          Object {
            "description": "The age in years of some agent.",
            "label": "age",
            "term": "foaf:age",
            "uri": "http://xmlns.com/foaf/0.1/age",
          },
          Object {
            "description": "A string expressing what the user is happy for the general public (normally) to know about their current activity.",
            "label": "status",
            "term": "foaf:status",
            "uri": "http://xmlns.com/foaf/0.1/status",
          },
        ],
      }
    `);
  });
});
