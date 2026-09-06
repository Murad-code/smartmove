import type { Block } from 'payload'

/**
 * Content blocks.
 *
 * A deliberately small, curated set. A general-purpose page builder would let
 * the owner produce layouts that do not match the design, so each block does
 * one recognisable job and is named the way an estate agent would name it.
 */

const headingFields: Block['fields'] = [
  {
    name: 'heading',
    type: 'text',
    label: 'Section heading',
  },
  {
    name: 'intro',
    type: 'textarea',
    label: 'Short introduction',
  },
]

export const TextBlock: Block = {
  slug: 'text',
  labels: { singular: 'Text section', plural: 'Text sections' },
  interfaceName: 'TextBlock',
  fields: [
    ...headingFields,
    {
      name: 'body',
      type: 'richText',
      required: true,
      label: 'Text',
    },
    {
      name: 'background',
      type: 'select',
      label: 'Background',
      defaultValue: 'white',
      options: [
        { label: 'White', value: 'white' },
        { label: 'Light grey', value: 'grey' },
      ],
    },
  ],
}

export const FeatureListBlock: Block = {
  slug: 'featureList',
  labels: { singular: 'List of features', plural: 'Lists of features' },
  interfaceName: 'FeatureListBlock',
  fields: [
    ...headingFields,
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 12,
      label: 'Features',
      labels: { singular: 'Feature', plural: 'Features' },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Title' },
        { name: 'description', type: 'textarea', label: 'Description' },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      label: 'How many across on a wide screen?',
      defaultValue: '3',
      options: [
        { label: 'Two', value: '2' },
        { label: 'Three', value: '3' },
        { label: 'Four', value: '4' },
      ],
    },
    {
      name: 'background',
      type: 'select',
      label: 'Background',
      defaultValue: 'white',
      options: [
        { label: 'White', value: 'white' },
        { label: 'Light grey', value: 'grey' },
        { label: 'Dark blue', value: 'navy' },
      ],
    },
  ],
}

export const StepsBlock: Block = {
  slug: 'steps',
  labels: { singular: 'Numbered steps', plural: 'Numbered steps' },
  interfaceName: 'StepsBlock',
  fields: [
    ...headingFields,
    {
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 8,
      label: 'Steps',
      labels: { singular: 'Step', plural: 'Steps' },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Step title' },
        { name: 'description', type: 'textarea', label: 'What happens' },
      ],
    },
  ],
}

export const ImageTextBlock: Block = {
  slug: 'imageText',
  labels: { singular: 'Photo with text', plural: 'Photos with text' },
  interfaceName: 'ImageTextBlock',
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Photo',
    },
    {
      name: 'imagePosition',
      type: 'select',
      label: 'Photo goes on the',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
    { name: 'heading', type: 'text', required: true, label: 'Heading' },
    { name: 'body', type: 'richText', label: 'Text' },
    {
      name: 'link',
      type: 'group',
      label: 'Button (optional)',
      fields: [
        { name: 'label', type: 'text', label: 'Button text' },
        { name: 'href', type: 'text', label: 'Where it goes', admin: { placeholder: '/properties' } },
      ],
    },
  ],
}

export const CallToActionBlock: Block = {
  slug: 'callToAction',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  interfaceName: 'CallToActionBlock',
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Heading' },
    { name: 'text', type: 'textarea', label: 'Supporting text' },
    {
      name: 'buttons',
      type: 'array',
      maxRows: 2,
      label: 'Buttons',
      labels: { singular: 'Button', plural: 'Buttons' },
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Button text' },
        {
          name: 'href',
          type: 'text',
          required: true,
          label: 'Where it goes',
          admin: { placeholder: '/contact' },
        },
      ],
    },
  ],
}

export const FormBlock: Block = {
  slug: 'form',
  labels: { singular: 'Enquiry form', plural: 'Enquiry forms' },
  interfaceName: 'FormBlock',
  fields: [
    { name: 'heading', type: 'text', label: 'Heading' },
    { name: 'intro', type: 'textarea', label: 'Short introduction' },
    {
      name: 'formType',
      type: 'select',
      required: true,
      defaultValue: 'general',
      label: 'Which form?',
      options: [
        { label: 'General enquiry', value: 'general' },
        { label: 'Landlord enquiry', value: 'landlord' },
        { label: 'Register property requirements', value: 'requirements' },
      ],
    },
  ],
}

export const ContactDetailsBlock: Block = {
  slug: 'contactDetails',
  labels: { singular: 'Our contact details', plural: 'Our contact details' },
  interfaceName: 'ContactDetailsBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      defaultValue: 'Visit or call us',
    },
    {
      name: 'showMap',
      type: 'checkbox',
      label: 'Show a link to the map',
      defaultValue: true,
    },
    {
      type: 'ui',
      name: 'sourceNote',
      admin: {
        components: {
          Field: '@/components/admin/ContactDetailsNote#ContactDetailsNote',
        },
      },
    },
  ],
}

export const PropertyShowcaseBlock: Block = {
  slug: 'propertyShowcase',
  labels: { singular: 'Available properties', plural: 'Available properties' },
  interfaceName: 'PropertyShowcaseBlock',
  fields: [
    { name: 'heading', type: 'text', label: 'Heading', defaultValue: 'Available now' },
    { name: 'intro', type: 'textarea', label: 'Short introduction' },
    {
      name: 'limit',
      type: 'number',
      label: 'How many to show',
      defaultValue: 3,
      min: 1,
      max: 12,
    },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'Questions and answers', plural: 'Questions and answers' },
  interfaceName: 'FaqBlock',
  fields: [
    ...headingFields,
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Questions',
      labels: { singular: 'Question', plural: 'Questions' },
      fields: [
        { name: 'question', type: 'text', required: true, label: 'Question' },
        { name: 'answer', type: 'richText', required: true, label: 'Answer' },
      ],
    },
  ],
}

export const pageBlocks = [
  TextBlock,
  FeatureListBlock,
  StepsBlock,
  ImageTextBlock,
  CallToActionBlock,
  PropertyShowcaseBlock,
  FaqBlock,
  ContactDetailsBlock,
  FormBlock,
]
