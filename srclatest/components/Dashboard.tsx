// import React from 'react';
// import {View, Text, ScrollView, Pressable} from 'react-native';
// import {Home as HomeIcon, Menu} from 'lucide-react-native';

// interface DashboardProps {
//   theme: 'light' | 'dark';
//   onMenuPress: () => void;
//   onThemeToggle: () => void;
// }

// const Dashboard: React.FC<DashboardProps> = ({
//   theme,
//   onMenuPress,
//   onThemeToggle,
// }) => {
//   const backgroundClass = theme === 'dark' ? 'bg-[#0f3d3e]' : 'bg-white';
//   const bodyBackgroundClass = theme === 'dark' ? 'bg-[#142828]' : 'bg-gray-100';
//   const headerTextClass = theme === 'dark' ? 'text-white' : 'text-black';
//   const subTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
//   const statusBgClass = theme === 'dark' ? 'bg-[#1c5c5c]' : 'bg-gray-200';

//   return (
//     <View className={`flex-1 ${backgroundClass}`}>
//       {/* HEADER */}
//       <View className="px-5 p-6">
//         <View className="flex-row justify-between items-center">
//           {/* MENU BUTTON */}
//           <Pressable onPress={onMenuPress}>
//             <Menu color={theme === 'dark' ? 'white' : 'black'} size={28} />
//           </Pressable>

//           <Text className="text-xs text-gray-300 tracking-widest">
//             TUESDAY, 25 MARCH 2026
//           </Text>

//           <View style={{width: 28}} />
//         </View>

//         <View className="flex-row justify-between items-center mt-5">
//           <Text className={`${headerTextClass} text-2xl font-bold`}>
//             Good Morning, Yash
//           </Text>

//           <View className="flex-row items-center">
//             <View className="w-10 h-10 rounded-full border-2 border-yellow-400 items-center justify-center mr-3">
//               <Text className={`${headerTextClass} font-semibold`}>Y</Text>
//             </View>

//             <Pressable
//               onPress={onThemeToggle}
//               className="w-10 h-10 rounded-full border-2 border-yellow-400 items-center justify-center">
//               <HomeIcon
//                 color={theme === 'dark' ? 'white' : 'black'}
//                 size={22}
//               />
//             </Pressable>
//           </View>
//         </View>

//         <Text className="text-yellow-300 mt-2 text-sm">
//           4 visits · 3 alerts need attention
//         </Text>

//         <View
//           className={`mt-3 self-start px-3 py-1 rounded-full ${statusBgClass}`}>
//           <Text className="text-yellow-300 text-xs">
//             OFFLINE · SYNCING WHEN CONNECTED
//           </Text>
//         </View>
//       </View>

//       {/* BODY */}
//       <View className={`flex-1 ${bodyBackgroundClass} rounded-t-3xl px-4 pt-6`}>
//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{paddingBottom: 120}}>
//           {/* STATS */}
//           <View className="flex-row justify-between">
//             <StatCard number="17" label="Active" sub="patients" theme={theme} />
//             <StatCard
//               number="3"
//               label="Alerts"
//               sub="need action"
//               theme={theme}
//             />
//             <StatCard number="2" label="Unpaid" sub="bills" theme={theme} />
//           </View>

//           {/* ALERTS */}
//           <SectionTitle title="ALERTS — ACTION NEEDED" />

//           <AlertCard
//             title="Dropout Risk"
//             desc="2 patients — no session in 7+ days"
//           />
//           <AlertCard title="Package Expiring" desc="3 days remaining" />
//           <AlertCard
//             title="Profile Update Request"
//             desc="Wants to update phone"
//           />
//           <AlertCard title="Report Due" desc="No report in 2+ weeks" />

//           {/* QUICK ACTIONS */}
//           <SectionTitle title="QUICK ACTIONS" />

//           <View className="flex-row justify-between">
//             <ActionCard title="LOG SESSION" />
//             <ActionCard title="PATIENTS" />
//             <ActionCard title="NEW BILL" />
//           </View>

//           {/* SCHEDULE */}
//           <SectionTitle title="TODAY’S SCHEDULE" />

//           <ScheduleCard time="9:00 AM" name="Ramesh Sharma" />
//           <ScheduleCard time="11:00 AM" name="Priya Gupta" />
//           <ScheduleCard time="2:30 PM" name="Sunita Meena" />
//         </ScrollView>
//       </View>
//     </View>
//   );
// };

// const StatCard = ({number, label, sub, theme}: any) => {
//   const cardBgClass = theme === 'dark' ? 'bg-[#0f3d3e]' : 'bg-white';
//   const cardTextClass = theme === 'dark' ? 'text-white' : 'text-[#0f3d3e]';
//   const labelClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

//   return (
//     <View
//       className={`${cardBgClass} w-[30%] rounded-2xl p-4 items-center shadow`}>
//       <Text className={`text-2xl font-bold ${cardTextClass}`}>{number}</Text>
//       <Text className={labelClass}>{label}</Text>
//       <Text className="text-xs text-yellow-600">{sub}</Text>
//     </View>
//   );
// };

// const SectionTitle = ({title}: any) => (
//   <View className="mt-6 mb-3">
//     <Text className="text-gray-500 text-xs tracking-widest">{title}</Text>
//   </View>
// );

// const AlertCard = ({title, desc}: any) => (
//   <View className="bg-white rounded-2xl p-4 mb-3 flex-row justify-between items-center shadow">
//     <View>
//       <Text className="text-gray-800 font-semibold">{title}</Text>
//       <Text className="text-gray-500 text-xs mt-1">{desc}</Text>
//     </View>
//     <Text className="text-gray-400">→</Text>
//   </View>
// );

// const ActionCard = ({title}: any) => (
//   <View className="bg-white w-[30%] rounded-2xl p-4 items-center shadow">
//     <View className="w-10 h-10 bg-gray-200 rounded-xl mb-2" />
//     <Text className="text-gray-600 text-xs">{title}</Text>
//   </View>
// );

// const ScheduleCard = ({time, name}: any) => (
//   <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow">
//     <View className="w-16">
//       <Text className="text-[#0f3d3e] font-semibold">{time}</Text>
//     </View>
//     <View className="flex-1">
//       <Text className="text-gray-800 font-semibold">{name}</Text>
//       <Text className="text-gray-500 text-xs">Session details here...</Text>
//     </View>
//     <Text className="text-gray-400">›</Text>
//   </View>
// );

// export default Dashboard;
