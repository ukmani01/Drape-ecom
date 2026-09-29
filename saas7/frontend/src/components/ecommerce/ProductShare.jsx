import React from 'react';
import { FacebookShareButton, TwitterShareButton, PinterestShareButton, WhatsappShareButton } from 'react-share';
import { FaFacebook, FaTwitter, FaPinterest, FaWhatsapp } from 'react-icons/fa';

export const ProductShare = ({ url, title }) => {
  return (
    <div className="flex space-x-2 mt-4">
      <FacebookShareButton url={url} title={title}>
        <FaFacebook size={24} className="text-blue-600 hover:opacity-80" />
      </FacebookShareButton>
      <TwitterShareButton url={url} title={title}>
        <FaTwitter size={24} className="text-blue-400 hover:opacity-80" />
      </TwitterShareButton>
      <PinterestShareButton url={url} media={url} description={title}>
        <FaPinterest size={24} className="text-red-600 hover:opacity-80" />
      </PinterestShareButton>
      <WhatsappShareButton url={url} title={title}>
        <FaWhatsapp size={24} className="text-green-500 hover:opacity-80" />
      </WhatsappShareButton>
    </div>
  );
};
