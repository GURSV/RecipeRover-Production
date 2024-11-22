/* eslint-disable react/no-children-prop */
import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { BackgroundLines } from './ui/background-lines';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      
      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS environment variables are not set.");
      }
      
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: ['garvitcpp@gmail.com', 'gurmeharsinghv@gmail.com']
        },
        publicKey
      );
      
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
    }

    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="min-h-screen relative bg-black text-white">
      <div className="absolute inset-0 bg-black">
        <BackgroundLines children={undefined} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >

          {/* Form Container */}
          <div className="bg-gray-900/60 mt-16 backdrop-blur-lg rounded-xl border-t border-gray-700/50"> {/* Changed rounded-t-xl to rounded-xl */}
           <div className="p-8">
             <div className="relative w-full h-52"> {/* Changed h-64 to h-52 (about 80%) */}
               <Image
                 src="/mail.gif"
                 alt="Email animation"
                 layout="fill"
                 objectFit="contain"
                 className="w-full"
               />
             </div>
             <h1 className="text-3xl font-bold mt-8 text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
               Get in Touch
             </h1>
         
             <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-medium">
                  Name
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition duration-200 outline-none text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-medium">
                  Email
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition duration-200 outline-none text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-medium">
                  Message
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition duration-200 outline-none text-white resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={status === 'sending'}
                className={`w-full py-3 px-6 rounded-lg font-medium text-white 
                  ${status === 'sending' 
                    ? 'bg-gray-600' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                  } 
                  transition duration-200 transform hover:shadow-lg`}
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </motion.button>

              {status === 'success' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 text-center text-sm"
                >
                  Message sent successfully!
                </motion.p>
              )}

              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-center text-sm"
                >
                  Failed to send message. Please try again.
                </motion.p>
              )}
            </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;